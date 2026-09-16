import { NextRequest } from 'next/server'
import { fetchGroupedDay } from '@/app/api/scanner/route'
import { fetchBenzingaMovers } from '@/app/api/movers/route'
import { subtractTradingDays } from '@/lib/indicators'

export interface LiveCandidate {
  ticker: string
  price: number
  changePct: number   // vs. prior close
  gapPct: number      // open vs. prior close
  volume: number
  todayRelVol: number // today volume vs. 5-day avg
}

export type LiveSource = 'benzinga-live' | 'polygon-eod'

export type LiveScanMessage =
  | { type: 'progress'; date: string; dayNum: number; totalDays: number; cached: boolean }
  | { type: 'scanning'; tickerCount: number }
  | { type: 'result'; asOfDate: string; scannedTickers: number; candidates: LiveCandidate[]; source: LiveSource; generatedAt?: string }
  | { type: 'error'; error: string }

// Benzinga live-price overlay ────────────────────────────────────────────────
// Polygon's free tier only ever returns the *previous* trading day's grouped
// bars (see `latestTradingDay()` below) — there is no live intraday endpoint
// on that plan. The discovery/filtering pass below still runs on Polygon's
// prior-day data as before; we then overlay real-time price/change from
// Benzinga's Market Movers feed (same source Dee, the trading agent, uses)
// on top of whichever candidates it happens to cover, and re-filter with the
// live numbers. This replaced an earlier approach (a snapshot file someone
// had to hand-generate via an MCP session) now that Benzinga gives this
// automatically with no manual step.
interface BenzingaOverlayQuote { price: number; previousClose: number }

function currentBenzingaSession(): 'PRE_MARKET' | 'REGULAR' | 'AFTER_MARKET' {
  // Minutes-since-midnight-ET check, since the 9:30 open and 4:00 close
  // boundaries fall mid-hour - an hour-only check misclassifies the whole
  // 9:00-9:30 window as REGULAR (empty pre-open) instead of PRE_MARKET.
  // Approximates EDT (UTC-4); off by 1 hour during EST (Nov-Mar).
  const now = new Date()
  const etMinutes = ((now.getUTCHours() - 4 + 24) % 24) * 60 + now.getUTCMinutes()
  if (etMinutes < 9 * 60 + 30) return 'PRE_MARKET'
  if (etMinutes < 16 * 60) return 'REGULAR'
  return 'AFTER_MARKET'
}

async function fetchBenzingaOverlay(): Promise<Map<string, BenzingaOverlayQuote> | null> {
  try {
    const session = currentBenzingaSession()
    const movers = await fetchBenzingaMovers(session, 200)
    const map = new Map<string, BenzingaOverlayQuote>()
    for (const m of [...movers.gainers, ...movers.losers]) {
      map.set(m.symbol, { price: m.price, previousClose: m.previousClose })
    }
    return map
  } catch {
    return null
  }
}

const BASELINE_DAYS = 5  // days used for average volume before the target day
// Lowered from 200k — that threshold silently excluded dormant microcaps that
// only start trading heavily on the day of the move (the classic low-float
// runner pattern, e.g. MDXI $0.54→$1.13). 50k still filters out truly
// untradeable names while letting real runners through.
const MIN_AVG_VOL   = 50_000

function latestTradingDay(): string {
  const d = new Date()
  if (d.getDay() === 0) d.setDate(d.getDate() - 2)
  else if (d.getDay() === 6) d.setDate(d.getDate() - 1)
  else d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const minPrice     = parseFloat(p.get('minPrice')     || '1')
  const maxPrice     = parseFloat(p.get('maxPrice')     || '20')
  const minChangePct = parseFloat(p.get('minChangePct') || '10')
  const minRelVol    = parseFloat(p.get('minRelVol')    || '3')

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ type: 'error', error: 'POLYGON_API_KEY not configured' }) + '\n',
      { headers: { 'Content-Type': 'application/x-ndjson' } }
    )
  }

  const FREE_PLAN = (process.env.POLYGON_PLAN ?? 'free') === 'free'
  const target = latestTradingDay()

  // Build date list: baseline days + target (oldest → newest)
  const dates: string[] = []
  for (let i = BASELINE_DAYS; i >= 1; i--) dates.push(subtractTradingDays(target, i))
  dates.push(target)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function emit(msg: LiveScanMessage) {
        controller.enqueue(encoder.encode(JSON.stringify(msg) + '\n'))
      }

      try {
        const dayData = new Map<string, { T: string; o: number; h: number; l: number; c: number; v: number }[]>()

        for (let i = 0; i < dates.length; i++) {
          const date = dates[i]
          // Only rate-limit actual live Polygon calls, not cache hits - an
          // unconditional per-iteration delay here defeated the whole point
          // of caching (every scan took 5x12.5s regardless of cache state).
          const { data, wasCached } = await fetchGroupedDay(date, apiKey)
          emit({ type: 'progress', date, dayNum: i + 1, totalDays: dates.length, cached: wasCached })
          if (!wasCached && FREE_PLAN) await new Promise(r => setTimeout(r, 12500))
          if (data.results) dayData.set(date, data.results)
        }

        const targetBars = dayData.get(target) ?? []
        emit({ type: 'scanning', tickerCount: targetBars.length })

        // Previous close map (day before target)
        const prevDate    = dates[dates.length - 2]
        const prevBars    = dayData.get(prevDate) ?? []
        const prevCloseMap = new Map(prevBars.map(b => [b.T, b.c]))

        // 5-day average volume baseline
        const baselineDates = dates.slice(0, BASELINE_DAYS)
        const avgVolMap = new Map<string, number>()
        for (const bar of targetBars) {
          const vols = baselineDates.map(d => dayData.get(d)?.find(b => b.T === bar.T)?.v ?? 0).filter(v => v > 0)
          if (vols.length > 0) avgVolMap.set(bar.T, vols.reduce((a, b) => a + b, 0) / vols.length)
        }

        const candidates: LiveCandidate[] = []

        for (const bar of targetBars) {
          const price = bar.c
          if (price < minPrice || price > maxPrice) continue

          const avgVol = avgVolMap.get(bar.T) ?? 0
          if (avgVol < MIN_AVG_VOL) continue

          const todayRelVol = avgVol > 0 ? bar.v / avgVol : 0
          if (todayRelVol < minRelVol) continue

          const prevClose = prevCloseMap.get(bar.T)
          const changePct = prevClose ? ((bar.c - prevClose) / prevClose) * 100 : ((bar.c - bar.o) / bar.o) * 100
          if (changePct < minChangePct) continue

          const gapPct = prevClose ? ((bar.o - prevClose) / prevClose) * 100 : 0

          candidates.push({ ticker: bar.T, price, changePct, gapPct, volume: bar.v, todayRelVol })
        }

        // Overlay real-time Benzinga prices for whichever candidates it covers,
        // then re-filter/re-sort since live change% can move candidates in or out.
        const overlay = await fetchBenzingaOverlay()
        let finalCandidates = candidates
        let source: LiveSource = 'polygon-eod'
        if (overlay && overlay.size > 0) {
          source = 'benzinga-live'
          finalCandidates = candidates
            .map(c => {
              const q = overlay.get(c.ticker)
              if (!q) return c
              return { ...c, price: q.price, changePct: ((q.price - q.previousClose) / q.previousClose) * 100 }
            })
            .filter(c => c.price >= minPrice && c.price <= maxPrice && c.changePct >= minChangePct)
        }
        finalCandidates.sort((a, b) => b.changePct - a.changePct)
        emit({
          type: 'result',
          asOfDate: target,
          scannedTickers: targetBars.length,
          candidates: finalCandidates.slice(0, 100),
          source,
          generatedAt: overlay && overlay.size > 0 ? new Date().toISOString() : undefined,
        })
      } catch (e) {
        emit({ type: 'error', error: String(e) })
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' },
  })
}
