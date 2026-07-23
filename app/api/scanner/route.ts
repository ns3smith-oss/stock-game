import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { subtractTradingDays } from '@/lib/indicators'
import { detectFlag, type DailyBar, type FlagMatch } from '@/lib/scanner'

type ScannerCandidate = FlagMatch & {
  ticker: string
  price: number
  avgVolume: number
}

// Free Polygon plan = 5 calls/min. One call per trading day (grouped/whole-market
// snapshot), so we throttle live (uncached) calls and cache completed days to disk —
// re-running the scan later only fetches the days it doesn't already have.
// Set POLYGON_PLAN=starter (or anything else) in .env.local once upgraded to remove the delay.
const CACHE_DIR = path.join(process.cwd(), '.scanner-cache')
const FREE_PLAN_DELAY_MS = 12500

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

interface GroupedDayResult {
  results?: { T: string; o: number; h: number; l: number; c: number; v: number }[]
}

async function fetchGroupedDay(date: string, apiKey: string): Promise<GroupedDayResult> {
  const cachePath = path.join(CACHE_DIR, `${date}.json`)
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
  }

  const url = `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${date}?adjusted=true&apiKey=${apiKey}`
  const res = await fetch(url)
  const data: GroupedDayResult = await res.json()

  if (data.results && data.results.length > 0) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cachePath, JSON.stringify(data))
  }

  return data
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const minPrice = parseFloat(searchParams.get('minPrice') ?? '1')
  const maxPrice = parseFloat(searchParams.get('maxPrice') ?? '20')
  const minRelVol = parseFloat(searchParams.get('minRelVol') ?? '2')
  const minAvgVolume = parseFloat(searchParams.get('minAvgVolume') ?? '200000')
  const lookbackDays = Math.min(parseInt(searchParams.get('lookbackDays') ?? '30'), 60)

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const plan = process.env.POLYGON_PLAN ?? 'free'
  const isFree = plan === 'free'

  // Build the list of candidate trading dates, oldest → newest.
  // Free tier doesn't expose "today" until it's fully closed out, so start from yesterday.
  const dates: string[] = []
  let cursor = subtractTradingDays(todayStr(), 1)
  while (dates.length < lookbackDays) {
    dates.push(cursor)
    cursor = subtractTradingDays(cursor, 1)
  }
  dates.reverse()

  const byTicker = new Map<string, DailyBar[]>()
  let liveCalls = 0
  let daysWithData = 0

  for (const date of dates) {
    const wasCached = fs.existsSync(path.join(CACHE_DIR, `${date}.json`))
    const data = await fetchGroupedDay(date, apiKey)

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

  const candidates: ScannerCandidate[] = []

  for (const [ticker, bars] of byTicker) {
    bars.sort((a, b) => a.date.localeCompare(b.date))
    const latest = bars[bars.length - 1]
    if (!latest) continue
    if (latest.close < minPrice || latest.close > maxPrice) continue

    const recentVols = bars.slice(-10).map((b) => b.volume)
    const avgRecentVol = recentVols.reduce((a, b) => a + b, 0) / recentVols.length
    if (avgRecentVol < minAvgVolume) continue

    const match = detectFlag(bars)
    if (!match || match.poleRelVol < minRelVol) continue

    candidates.push({
      ticker,
      price: latest.close,
      avgVolume: Math.round(avgRecentVol),
      ...match,
    })
  }

  candidates.sort((a, b) => b.confidence - a.confidence)

  return NextResponse.json({
    asOfDate: dates[dates.length - 1],
    scannedTickers: byTicker.size,
    daysWithData,
    liveCallsMade: liveCalls,
    plan,
    candidates: candidates.slice(0, 100),
  })
}
