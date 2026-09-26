// GET /api/data/tickers - US stock ticker reference list, via Massive, including delisted names.
//
//   ?date=2025-01-02            tickers that were listed on that date (even if delisted since)
//   ?active=false               currently delisted tickers
//   ?type=CS                    common stock only (default); pass type=all for every type
//   ?next=<cursor>              the `next` value from a previous page (1,000 per page)
//
// Response: { count, tickers: [{ ticker, name, type, exchange, active, delisted }], next }.
// Requires `Authorization: Bearer <DATA_RELAY_TOKEN>`.

import { NextRequest, NextResponse } from 'next/server'
import { checkRelayAuth, polygonFetch, polygonUrl, publicNext, resolveNext, DATE_RE } from '@/lib/dataRelay'

export async function GET(req: NextRequest) {
  const denied = checkRelayAuth(req)
  if (denied) return denied

  const p = req.nextUrl.searchParams
  let url = resolveNext(p.get('next'), '/v3/reference/tickers')
  if (p.get('next') && !url) return NextResponse.json({ error: 'Invalid next cursor' }, { status: 400 })

  if (!url) {
    const params: Record<string, string> = { market: 'stocks', limit: '1000', order: 'asc', sort: 'ticker' }
    const date = p.get('date')
    if (date) {
      if (!DATE_RE.test(date)) return NextResponse.json({ error: 'date must be YYYY-MM-DD' }, { status: 400 })
      params.date = date
    }
    const active = p.get('active')
    if (active === 'true' || active === 'false') params.active = active
    const type = p.get('type') ?? 'CS'
    if (type !== 'all') {
      if (!/^[A-Z]{1,10}$/.test(type)) return NextResponse.json({ error: 'type must be a Massive ticker type such as CS, or all' }, { status: 400 })
      params.type = type
    }
    url = polygonUrl('/v3/reference/tickers', params)
  }

  const result = await polygonFetch(url)
  if (!result.ok) return result.response

  const tickers = (result.json.results ?? []).map((r: any) => ({
    ticker: r.ticker,
    name: r.name,
    type: r.type,
    exchange: r.primary_exchange,
    active: r.active,
    delisted: r.delisted_utc ?? null,
  }))
  return NextResponse.json({ count: tickers.length, tickers, next: publicNext(result.json.next_url) })
}
