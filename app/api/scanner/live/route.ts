import { NextRequest } from 'next/server'
import { fetchGroupedDay } from '@/app/api/scanner/route'
import { subtractTradingDays } from '@/lib/indicators'

export interface LiveCandidate {
  ticker: string
  price: number
  changePct: number   // vs. prior close
  gapPct: number      // open vs. prior close
  volume: number
  todayRelVol: number // today volume vs. 5-day avg
}

export type LiveScanMessage =
  | { type: 'progress'; date: string; dayNum: number; totalDays: number; cached: boolean }
  | { type: 'scanning'; tickerCount: number }
  | { type: 'result'; asOfDate: string; scannedTickers: number; candidates: LiveCandidate[] }
  | { type: 'error'; error: string }

const BASELINE_DAYS = 5  // days used for average volume before the target day
const MIN_AVG_VOL   = 200_000

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
          if (FREE_PLAN && i > 0) await new Promise(r => setTimeout(r, 12500))
          const { data, wasCached } = await fetchGroupedDay(date, apiKey)
          emit({ type: 'progress', date, dayNum: i + 1, totalDays: dates.length, cached: wasCached })
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

        candidates.sort((a, b) => b.changePct - a.changePct)
        emit({ type: 'result', asOfDate: target, scannedTickers: targetBars.length, candidates: candidates.slice(0, 100) })
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
