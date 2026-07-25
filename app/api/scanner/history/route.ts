import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import fs from 'fs'
import path from 'path'
import { findAllFlags, type HistoricalFlag } from '@/lib/scanner'

export interface HistoryResult {
  ticker: string
  flags: HistoricalFlag[]
  breakouts: number
  failures: number
  neutral: number
  winRate: number | null  // breakouts / (breakouts + failures), null if no data
}

// ── Cache helpers (reuse same dual-cache pattern as scanner) ─────────────────
const CACHE_DIR = path.join(process.cwd(), '.scanner-cache')

function isKVAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function readCache<T>(key: string): Promise<T | null> {
  if (isKVAvailable()) {
    const val = await kv.get<T>(key)
    return val ?? null
  }
  const diskPath = path.join(CACHE_DIR, `${key}.json`)
  if (fs.existsSync(diskPath)) return JSON.parse(fs.readFileSync(diskPath, 'utf-8')) as T
  return null
}

async function writeCache<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  if (isKVAvailable()) {
    await kv.set(key, data, ttlSeconds ? { ex: ttlSeconds } : {})
    return
  }
  const diskPath = path.join(CACHE_DIR, `${key}.json`)
  fs.mkdirSync(path.dirname(diskPath), { recursive: true })
  fs.writeFileSync(diskPath, JSON.stringify(data))
}

// ── Fetch ~1 year of daily bars for a single ticker ──────────────────────────
async function fetchTickerBars(ticker: string, apiKey: string) {
  const to   = new Date(); to.setDate(to.getDate() - 1)
  const from = new Date(to); from.setFullYear(from.getFullYear() - 1)
  const toStr   = to.toISOString().split('T')[0]
  const fromStr = from.toISOString().split('T')[0]

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${fromStr}/${toStr}?adjusted=true&sort=asc&limit=365&apiKey=${apiKey}`
  const res  = await fetch(url)
  const data = await res.json() as { results?: { t: number; o: number; h: number; l: number; c: number; v: number }[] }
  return data.results ?? []
}

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase()
  if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 })

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'POLYGON_API_KEY not configured' }, { status: 500 })

  const today    = new Date().toISOString().split('T')[0]
  const cacheKey = `scanner:hist:${ticker}:${today}`

  const cached = await readCache<HistoryResult>(cacheKey)
  if (cached) return NextResponse.json(cached)

  const rawBars = await fetchTickerBars(ticker, apiKey)
  if (rawBars.length === 0) {
    return NextResponse.json({ error: `No data found for ${ticker}` }, { status: 404 })
  }

  const bars = rawBars.map(b => ({
    date:   new Date(b.t).toISOString().split('T')[0],
    open:   b.o,
    high:   b.h,
    low:    b.l,
    close:  b.c,
    volume: b.v,
  }))

  const flags = findAllFlags(bars)
  const breakouts = flags.filter(f => f.outcomeLabel === 'breakout').length
  const failures  = flags.filter(f => f.outcomeLabel === 'failed').length
  const neutral   = flags.filter(f => f.outcomeLabel === 'neutral').length
  const winRate   = (breakouts + failures) > 0
    ? Math.round((breakouts / (breakouts + failures)) * 100)
    : null

  const result: HistoryResult = { ticker, flags: flags.reverse(), breakouts, failures, neutral, winRate }

  // Cache for 24h — daily bars only change at market close
  await writeCache(cacheKey, result, 24 * 60 * 60)

  return NextResponse.json(result)
}
