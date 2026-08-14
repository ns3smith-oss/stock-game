import { NextRequest } from 'next/server'
import { Redis } from '@upstash/redis'
import fs from 'fs'
import path from 'path'
import { subtractTradingDays } from '@/lib/indicators'
import { detectFlag, type DailyBar, type FlagMatch } from '@/lib/scanner'

export type ScannerCandidate = FlagMatch & {
  ticker: string
  price: number
  avgVolume: number
  changePct: number
  gapPct: number
  todayRelVol: number
  float: number | null
  hasNews: boolean
  newsCount: number
}

// Stream message shapes ─────────────────────────────────────────────────────
export type ScanMessage =
  | { type: 'progress';  date: string; dayNum: number; totalDays: number; cached: boolean }
  | { type: 'scanning';  tickerCount: number }
  | { type: 'enriching'; ticker: string; step: number; total: number }
  | { type: 'result';    asOfDate: string; scannedTickers: number; daysWithData: number; liveCallsMade: number; plan: string; usingKV: boolean; candidates: ScannerCandidate[] }
  | { type: 'error';     error: string }

// Cache ─────────────────────────────────────────────────────────────────────
const CACHE_DIR = path.join(process.cwd(), '.scanner-cache')
const FREE_PLAN_DELAY_MS = 12500

function isKVAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

const kv = isKVAvailable()
  ? new Redis({ url: process.env.KV_REST_API_URL!, token: process.env.KV_REST_API_TOKEN! })
  : null

async function readCache<T>(key: string): Promise<T | null> {
  if (kv) {
    const val = await kv.get<T>(key)
    return val ?? null
  }
  const diskPath = path.join(CACHE_DIR, `${key}.json`)
  if (fs.existsSync(diskPath)) return JSON.parse(fs.readFileSync(diskPath, 'utf-8')) as T
  return null
}

async function writeCache<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  if (kv) {
    await kv.set(key, data, ttlSeconds ? { ex: ttlSeconds } : {})
    return
  }
  const diskPath = path.join(CACHE_DIR, `${key}.json`)
  fs.mkdirSync(path.dirname(diskPath), { recursive: true })
  fs.writeFileSync(diskPath, JSON.stringify(data))
}

// Grouped daily bars ─────────────────────────────────────────────────────────
interface GroupedBar { T: string; o: number; h: number; l: number; c: number; v: number }
interface GroupedDayResult { results?: GroupedBar[] }

export async function fetchGroupedDay(
  date: string,
  apiKey: string
): Promise<{ data: GroupedDayResult; wasCached: boolean }> {
  const cacheKey = `scanner:day:${date}`
  const cached = await readCache<GroupedDayResult>(cacheKey)
  if (cached) return { data: cached, wasCached: true }

  const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${apiKey}`
  const res  = await fetch(url)
  const data: GroupedDayResult = await res.json()

  if (data.results && data.results.length > 0) {
    await writeCache(cacheKey, data, 90 * 24 * 60 * 60)
  }
  return { data, wasCached: false }
}

// Enrichment ─────────────────────────────────────────────────────────────────
async function fetchFloat(ticker: string, apiKey: string): Promise<number | null> {
  const key = `scanner:float:${ticker}`
  const cached = await readCache<number>(key)
  if (cached !== null) return cached
  try {
    const res  = await fetch(`https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`)
    const data = await res.json()
    const shares: number | null = data.results?.share_class_shares_outstanding ?? null
    if (shares !== null) await writeCache(key, shares, 7 * 24 * 60 * 60)
    return shares
  } catch { return null }
}

async function fetchNews(ticker: string, apiKey: string, since: string): Promise<{ hasNews: boolean; newsCount: number }> {
  const key = `scanner:news:${ticker}:${since}`
  const cached = await readCache<{ hasNews: boolean; newsCount: number }>(key)
  if (cached) return cached
  try {
    const url  = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&published_utc.gte=${since}&limit=10&order=desc&apiKey=${apiKey}`
    const res  = await fetch(url)
    const data = await res.json()
    const result = { hasNews: (data.results?.length ?? 0) > 0, newsCount: data.results?.length ?? 0 }
    await writeCache(key, result, 24 * 60 * 60)
    return result
  } catch { return { hasNews: false, newsCount: 0 } }
}

// ─── Main route ──────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split('T')[0] }
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

export async function GET(req: NextRequest): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const minPrice     = parseFloat(searchParams.get('minPrice')     ?? '1')
  const maxPrice     = parseFloat(searchParams.get('maxPrice')     ?? '20')
  const minChangePct = parseFloat(searchParams.get('minChangePct') ?? '10')
  const minRelVol    = parseFloat(searchParams.get('minRelVol')    ?? '5')
  const maxFloat     = parseFloat(searchParams.get('maxFloat')     ?? 'Infinity')
  const requireNews  = searchParams.get('requireNews') === 'true'
  const minAvgVolume = parseFloat(searchParams.get('minAvgVolume') ?? '200000')
  const lookbackDays = Math.min(parseInt(searchParams.get('lookbackDays') ?? '30'), 60)

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(msg: ScanMessage) {
        controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'))
      }

      try {
        const apiKey = process.env.POLYGON_API_KEY
        if (!apiKey) { send({ type: 'error', error: 'API key not configured' }); controller.close(); return }

        const plan   = process.env.POLYGON_PLAN ?? 'free'
        const isFree = plan === 'free'

        // Build date list oldest → newest, starting from yesterday
        const dates: string[] = []
        let cursor = subtractTradingDays(todayStr(), 1)
        while (dates.length < lookbackDays) { dates.push(cursor); cursor = subtractTradingDays(cursor, 1) }
        dates.reverse()

        // ── Phase 1: fetch daily bars ──────────────────────────────────────
        const byTicker = new Map<string, DailyBar[]>()
        let liveCalls  = 0
        let daysWithData = 0

        for (let i = 0; i < dates.length; i++) {
          const date = dates[i]

          // Peek at cache so we can report cached: true/false before the fetch
          const peeked = await readCache<GroupedDayResult>(`scanner:day:${date}`)
          send({ type: 'progress', date, dayNum: i + 1, totalDays: dates.length, cached: peeked !== null })

          const { data, wasCached } = peeked
            ? { data: peeked, wasCached: true }
            : await fetchGroupedDay(date, apiKey)

          if (!wasCached) {
            liveCalls++
            if (isFree) await sleep(FREE_PLAN_DELAY_MS)
          }

          if (!data.results || data.results.length === 0) continue
          daysWithData++

          for (const r of data.results) {
            if (!byTicker.has(r.T)) byTicker.set(r.T, [])
            byTicker.get(r.T)!.push({ date, open: r.o, high: r.h, low: r.l, close: r.c, volume: r.v })
          }
        }

        // ── Phase 2: flag detection (fast) ─────────────────────────────────
        send({ type: 'scanning', tickerCount: byTicker.size })

        const candidates: ScannerCandidate[] = []

        for (const [ticker, bars] of byTicker) {
          bars.sort((a, b) => a.date.localeCompare(b.date))
          const latest = bars[bars.length - 1]
          const prev   = bars[bars.length - 2]
          if (!latest || !prev) continue
          if (latest.close < minPrice || latest.close > maxPrice) continue

          const recentVols   = bars.slice(-10).map(b => b.volume)
          const avgRecentVol = recentVols.reduce((a, b) => a + b, 0) / recentVols.length
          if (avgRecentVol < minAvgVolume) continue

          const changePct   = ((latest.close - prev.close) / prev.close) * 100
          const gapPct      = ((latest.open  - prev.close) / prev.close) * 100
          const todayRelVol = avgRecentVol > 0 ? latest.volume / avgRecentVol : 0

          const match = detectFlag(bars)
          if (!match) continue

          // minRelVol applies to the POLE's peak relative volume (not today's).
          // Today's changePct/todayRelVol are display-only — a flag consolidation
          // has LOW daily change and LOW volume by definition, so filtering on them
          // would eliminate every valid flag setup.
          if (match.poleRelVol < minRelVol) continue

          candidates.push({
            ticker, price: latest.close, avgVolume: Math.round(avgRecentVol),
            changePct, gapPct, todayRelVol,
            float: null, hasNews: false, newsCount: 0,
            ...match,
          })
        }

        candidates.sort((a, b) => b.confidence - a.confidence)

        // ── Phase 3: enrichment (only when filters require it) ─────────────
        const enrichmentEnabled = requireNews || isFinite(maxFloat)
        const toEnrich = enrichmentEnabled ? candidates.slice(0, 30) : []
        const newsSince = dates[dates.length - 3] ?? dates[0]
        let enrichCalls = 0

        for (let i = 0; i < toEnrich.length; i++) {
          const c = toEnrich[i]
          send({ type: 'enriching', ticker: c.ticker, step: i + 1, total: toEnrich.length })

          const floatCached = await readCache<number>(`scanner:float:${c.ticker}`)
          const newsCached  = await readCache<{ hasNews: boolean; newsCount: number }>(`scanner:news:${c.ticker}:${newsSince}`)

          if (floatCached === null) {
            if (enrichCalls > 0) await sleep(isFree ? 2000 : 300)
            c.float = await fetchFloat(c.ticker, apiKey)
            enrichCalls++
          } else { c.float = floatCached }

          if (newsCached === null) {
            if (enrichCalls > 0) await sleep(isFree ? 2000 : 300)
            const news = await fetchNews(c.ticker, apiKey, newsSince)
            c.hasNews = news.hasNews; c.newsCount = news.newsCount
            enrichCalls++
          } else { c.hasNews = newsCached.hasNews; c.newsCount = newsCached.newsCount }
        }

        const filtered = enrichmentEnabled
          ? candidates.filter(c => {
              if (requireNews && !c.hasNews) return false
              if (isFinite(maxFloat) && c.float !== null && c.float > maxFloat) return false
              return true
            })
          : candidates

        send({
          type: 'result',
          asOfDate: dates[dates.length - 1],
          scannedTickers: byTicker.size,
          daysWithData,
          liveCallsMade: liveCalls + enrichCalls,
          plan,
          usingKV: isKVAvailable(),
          candidates: filtered.slice(0, 100),
        })
        controller.close()

      } catch (err) {
        send({ type: 'error', error: String(err) })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
