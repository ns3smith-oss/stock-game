// Plain REST wrapper around Benzinga's Market Movers API, for the human-facing
// Movers tab in the Scanner Hub UI. Separate from /api/mcp/benzinga (the MCP
// JSON-RPC relay Dee uses) on purpose - a browser fetch shouldn't have to
// speak JSON-RPC, and keeping these independent means either one can change
// without touching the other. Both call Benzinga directly; neither depends
// on the other.

import { NextRequest, NextResponse } from 'next/server'

export interface MoverCandidate {
  symbol: string
  companyName: string
  price: number
  changePercent: number
  change: number
  volume: number
  averageVolume: number | null
  previousClose: number
  marketCap: number | null
  shareFloat: number | null
  sector: string | null
}

export interface MoversResult {
  session: string
  fetchedAt: string
  gainers: MoverCandidate[]
  losers: MoverCandidate[]
}

function toCandidate(raw: Record<string, unknown>): MoverCandidate {
  return {
    symbol: String(raw.symbol ?? ''),
    companyName: String(raw.companyName ?? raw.symbol ?? ''),
    price: Number(raw.price ?? 0),
    changePercent: Number(raw.changePercent ?? 0),
    change: Number(raw.change ?? 0),
    volume: Number(raw.volume ?? 0),
    averageVolume: raw.averageVolume != null ? Number(raw.averageVolume) : null,
    previousClose: Number(raw.previousClose ?? 0),
    marketCap: raw.marketCap != null ? Number(raw.marketCap) : null,
    shareFloat: raw.shareFloat != null ? Number(raw.shareFloat) : null,
    sector: raw.gicsSectorName != null ? String(raw.gicsSectorName) : null,
  }
}

// Reusable server-side fetch, so other routes (e.g. the Live scanner's
// real-time overlay) can pull Benzinga movers directly without an extra
// HTTP hop through this route. Throws on failure - callers decide how to
// degrade (this route turns it into a JSON error response; the Live
// scanner falls back to EOD-only data).
export async function fetchBenzingaMovers(session: string, maxResults: number): Promise<MoversResult> {
  const apiKey = process.env.BENZINGA_API_KEY
  if (!apiKey) throw new Error('BENZINGA_API_KEY is not configured on the server.')

  const url = new URL('https://api.benzinga.com/api/v1/market/movers')
  url.searchParams.set('token', apiKey)
  url.searchParams.set('session', session)
  url.searchParams.set('maxResults', String(maxResults))

  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Benzinga returned HTTP ${res.status}: ${text.slice(0, 300)}`)
  }

  const json = await res.json()
  return {
    session,
    fetchedAt: new Date().toISOString(),
    gainers: (json?.result?.gainers ?? []).map(toCandidate),
    losers: (json?.result?.losers ?? []).map(toCandidate),
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const session = searchParams.get('session') ?? 'REGULAR'
  const maxResults = parseInt(searchParams.get('maxResults') ?? '50', 10)

  try {
    const result = await fetchBenzingaMovers(session, maxResults)
    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: String(e instanceof Error ? e.message : e) }, { status: 502 })
  }
}
