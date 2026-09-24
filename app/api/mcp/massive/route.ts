// MCP (Model Context Protocol) relay for whole-market movers, sourced from
// Massive (Polygon.io's 2026 rebrand) instead of Benzinga.
//
// Why this exists: researched 2026-09-24 (Dee repo README.md item 20/30) as
// a cheaper, simpler replacement for the Benzinga Movers relay at
// ../benzinga/route.ts. Massive rolls OTC coverage into every stocks plan at
// no extra cost and natively supports warrants as a ticker type - the two
// gaps that ruled out Alpaca - and its Full Market Snapshot endpoint already
// computes today's %-change per ticker, which is the whole "movers"
// calculation Benzinga was being paid to do. Real-time (not 15-min-delayed)
// access requires the Stocks Advanced plan ($199/mo); this code works
// unchanged on any tier - the account's plan level, not this code, decides
// how fresh the data is. No account upgrade has happened yet as of writing.
//
// STATUS 2026-09-24: built and deployed standing alone, deliberately NOT
// wired into any of Dee's routine connectors yet. The existing Benzinga
// relay (../benzinga/route.ts) keeps running exactly as before - nothing
// about Dee's live setup changes until Nicole explicitly approves the swap,
// per the Dee repo's README.md item 20 sequencing (Benzinga trial lapses ->
// evaluation break -> decide the Massive upgrade + live-trading go-ahead
// together). This route exists so it can be tested and attached as its own
// claude.ai connector independently, side by side with Benzinga_Movers.
//
// The Polygon/Massive API key lives server-side only (POLYGON_API_KEY,
// already set in Vercel's project environment variables for the Setups/Live
// scanner routes - see app/api/scanner/live/route.ts) - it never reaches
// the caller.
//
// Known gap vs. the Benzinga relay: Massive's snapshot endpoint returns
// price/volume/change data only - no company name, market cap, share
// float, or sector (Benzinga bundled those in one call; Massive splits
// company reference data into a separate endpoint this relay doesn't call,
// to keep this a single fast request). Those fields come back null below.
// Also no separate trailing "average volume" baseline - matches the
// existing README item 33 finding that Benzinga's averageVolume field was
// already unreliable vs. Robinhood's own trailing average, so Dee's
// existing Robinhood cross-check step is the real source of truth for
// volume baselines regardless of which movers relay discovers a candidate.

import { NextRequest, NextResponse } from 'next/server'

const PROTOCOL_VERSION = '2025-06-18'
const SERVER_INFO = { name: 'massive-movers-relay', version: '1.0.0' }

const TOOLS = [
  {
    name: 'get_market_movers',
    description:
      'Get live whole-market movers (biggest gainers and losers by percent change) from Massive ' +
      '(Polygon.io), including OTC/pink-sheet securities and warrants. Use this to discover stocks ' +
      'making large moves right now, not just to look up symbols you already know - this is a ' +
      'whole-market screener, not a per-symbol quote lookup. Reflects the current session\'s change ' +
      'continuously (no separate PRE_MARKET/AFTER_MARKET split the way the old Benzinga relay had).',
    inputSchema: {
      type: 'object',
      properties: {
        session: {
          type: 'string',
          enum: ['PRE_MARKET', 'REGULAR', 'AFTER_MARKET'],
          description:
            'Accepted for interface compatibility with the prior Benzinga-backed tool, but not used ' +
            'to filter - Massive\'s snapshot always reflects the latest available data regardless of ' +
            'session.',
        },
        maxResults: {
          type: 'integer',
          description: 'Max number of gainers and max number of losers to return (each side capped separately). Defaults to 50.',
        },
        includeOtc: {
          type: 'boolean',
          description: 'Include OTC/pink-sheet securities in the results. Defaults to true - this relay exists specifically to cover that universe.',
        },
      },
    },
  },
] as const

type JsonRpcRequest = {
  jsonrpc: '2.0'
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

interface MoverCandidate {
  symbol: string
  companyName: string | null
  price: number
  changePercent: number
  change: number
  volume: number
  averageVolume: null
  previousClose: number
  marketCap: null
  shareFloat: null
  sector: null
}

interface MoversResult {
  session: string
  fetchedAt: string
  source: 'massive'
  gainers: MoverCandidate[]
  losers: MoverCandidate[]
}

function jsonRpcResult(id: string | number | null | undefined, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result })
}

function jsonRpcError(id: string | number | null | undefined, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { status: 200 } // JSON-RPC errors are still HTTP 200 - the error lives in the body
  )
}

interface RawSnapshotTicker {
  ticker: string
  todaysChange?: number
  todaysChangePerc?: number
  day?: { c?: number; v?: number }
  prevDay?: { c?: number }
}

function toCandidate(raw: RawSnapshotTicker): MoverCandidate {
  const price = raw.day?.c ?? 0
  const previousClose = raw.prevDay?.c ?? 0
  return {
    symbol: raw.ticker,
    companyName: null,
    price,
    changePercent: raw.todaysChangePerc ?? 0,
    change: raw.todaysChange ?? 0,
    volume: raw.day?.v ?? 0,
    averageVolume: null,
    previousClose,
    marketCap: null,
    shareFloat: null,
    sector: null,
  }
}

export async function fetchMassiveMovers(maxResults: number, includeOtc: boolean): Promise<MoversResult> {
  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    throw new Error('POLYGON_API_KEY is not configured on the server (Vercel project environment variables).')
  }

  const url = new URL('https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers')
  url.searchParams.set('include_otc', String(includeOtc))
  url.searchParams.set('apiKey', apiKey)

  const res = await fetch(url.toString(), { method: 'GET' })
  const bodyText = await res.text()

  if (!res.ok) {
    throw new Error(`Massive (Polygon) returned HTTP ${res.status}: ${bodyText.slice(0, 500)}`)
  }

  const json = JSON.parse(bodyText) as { tickers?: RawSnapshotTicker[] }
  const tickers = json.tickers ?? []

  // Only rank tickers that actually traded today - a snapshot with no volume
  // or no price is a stale/halted entry, not a real mover.
  const active = tickers.filter((t) => (t.day?.v ?? 0) > 0 && (t.day?.c ?? 0) > 0)

  const sorted = [...active].sort((a, b) => (b.todaysChangePerc ?? 0) - (a.todaysChangePerc ?? 0))
  const gainers = sorted.slice(0, maxResults).map(toCandidate)
  const losers = sorted.slice(-maxResults).reverse().map(toCandidate)

  return {
    session: 'REGULAR',
    fetchedAt: new Date().toISOString(),
    source: 'massive',
    gainers,
    losers,
  }
}

export async function POST(req: NextRequest) {
  let body: JsonRpcRequest
  try {
    body = await req.json()
  } catch {
    return jsonRpcError(null, -32700, 'Parse error: invalid JSON')
  }

  if (body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return jsonRpcError(body.id, -32600, 'Invalid Request: not a valid JSON-RPC 2.0 request')
  }

  const { id, method, params } = body

  switch (method) {
    case 'initialize':
      return jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      })

    case 'notifications/initialized':
      return new NextResponse(null, { status: 202 })

    case 'tools/list':
      return jsonRpcResult(id, { tools: TOOLS })

    case 'tools/call': {
      const toolName = params?.name as string | undefined
      const toolArgs = (params?.arguments as Record<string, unknown>) ?? {}

      if (toolName !== 'get_market_movers') {
        return jsonRpcError(id, -32602, `Unknown tool: ${toolName}`)
      }

      const maxResults = typeof toolArgs.maxResults === 'number' ? toolArgs.maxResults : 50
      const includeOtc = typeof toolArgs.includeOtc === 'boolean' ? toolArgs.includeOtc : true

      try {
        const result = await fetchMassiveMovers(maxResults, includeOtc)
        return jsonRpcResult(id, {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: false,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        return jsonRpcResult(id, {
          content: [{ type: 'text', text: `Error: ${message}` }],
          isError: true,
        })
      }
    }

    case 'ping':
      return jsonRpcResult(id, {})

    default:
      return jsonRpcError(id, -32601, `Method not found: ${method}`)
  }
}

export async function GET() {
  // Stateless request/response only, same as the Benzinga relay - no
  // server-initiated streaming needed for a single read-only tool.
  return new NextResponse(null, { status: 405 })
}
