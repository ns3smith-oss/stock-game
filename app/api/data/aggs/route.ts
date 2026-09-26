// GET /api/data/aggs - historical OHLCV bars for one ticker (minute / hour / day), via Massive.
//
//   ?ticker=AAPL&from=2025-01-02&to=2025-01-31&timespan=minute&multiplier=1&adjusted=true
//   ?next=<the `next` value from a previous page>
//
// Response: { ticker, timespan, multiplier, adjusted, count, bars: [[t, o, h, l, c, v], ...], next }
// where t is the bar's start in epoch milliseconds (UTC) and `next` is null on the last page.
// Minute bars include pre/post-market; filter by time on the caller's side if you need
// regular hours only. Requires `Authorization: Bearer <DATA_RELAY_TOKEN>`.

import { NextRequest, NextResponse } from 'next/server'
import { checkRelayAuth, polygonFetch, polygonUrl, publicNext, resolveNext, DATE_RE, TICKER_RE } from '@/lib/dataRelay'

const TIMESPANS = new Set(['minute', 'hour', 'day'])

export async function GET(req: NextRequest) {
  const denied = checkRelayAuth(req)
  if (denied) return denied

  const p = req.nextUrl.searchParams
  let url = resolveNext(p.get('next'), '/v2/aggs/ticker/')
  if (p.get('next') && !url) return NextResponse.json({ error: 'Invalid next cursor' }, { status: 400 })

  const ticker = (p.get('ticker') ?? '').toUpperCase()
  const timespan = p.get('timespan') ?? 'day'
  const multiplier = parseInt(p.get('multiplier') ?? '1', 10)
  const adjusted = p.get('adjusted') !== 'false'

  if (!url) {
    const from = p.get('from') ?? ''
    const to = p.get('to') ?? ''
    if (!TICKER_RE.test(ticker)) return NextResponse.json({ error: 'ticker is required (e.g. AAPL)' }, { status: 400 })
    if (!DATE_RE.test(from) || !DATE_RE.test(to)) return NextResponse.json({ error: 'from and to are required as YYYY-MM-DD' }, { status: 400 })
    if (!TIMESPANS.has(timespan)) return NextResponse.json({ error: 'timespan must be minute, hour or day' }, { status: 400 })
    if (!(multiplier >= 1 && multiplier <= 60)) return NextResponse.json({ error: 'multiplier must be 1-60' }, { status: 400 })
    url = polygonUrl(`/v2/aggs/ticker/${encodeURIComponent(ticker)}/range/${multiplier}/${timespan}/${from}/${to}`, {
      adjusted: String(adjusted), sort: 'asc', limit: '50000',
    })
  }

  const result = await polygonFetch(url)
  if (!result.ok) return result.response
  const json = result.json
  const bars = (json.results ?? []).map((r: any) => [r.t, r.o, r.h, r.l, r.c, r.v])

  return NextResponse.json({
    ticker: json.ticker ?? ticker,
    timespan,
    multiplier,
    adjusted: json.adjusted ?? adjusted,
    count: bars.length,
    bars,
    next: publicNext(json.next_url),
  })
}
