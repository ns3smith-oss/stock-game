// GET /api/data/grouped?date=2025-03-14 - every US stock's daily bar for one date, via Massive.
// Includes names that have since delisted, so it's the survivorship-free way to find "what
// moved that day". Response: { date, count, bars: [[ticker, o, h, l, c, v], ...] }.
// OTC is excluded unless ?include_otc=true. Requires `Authorization: Bearer <DATA_RELAY_TOKEN>`.

import { NextRequest, NextResponse } from 'next/server'
import { checkRelayAuth, polygonFetch, polygonUrl, DATE_RE } from '@/lib/dataRelay'

export async function GET(req: NextRequest) {
  const denied = checkRelayAuth(req)
  if (denied) return denied

  const date = req.nextUrl.searchParams.get('date') ?? ''
  if (!DATE_RE.test(date)) return NextResponse.json({ error: 'date is required as YYYY-MM-DD' }, { status: 400 })
  const includeOtc = req.nextUrl.searchParams.get('include_otc') === 'true'
  const adjusted = req.nextUrl.searchParams.get('adjusted') !== 'false'

  const result = await polygonFetch(polygonUrl(`/v2/aggs/grouped/locale/us/market/stocks/${date}`, {
    adjusted: String(adjusted), include_otc: String(includeOtc),
  }))
  if (!result.ok) return result.response

  const bars = (result.json.results ?? []).map((r: any) => [r.T, r.o, r.h, r.l, r.c, r.v])
  return NextResponse.json({ date, count: bars.length, bars })
}
