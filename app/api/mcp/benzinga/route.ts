// MCP (Model Context Protocol) relay for Benzinga's Market Movers API.
//
// Why this exists: Dee's cloud routine sandbox (Anthropic's CCR environment)
// blocks outbound calls to api.benzinga.com at the network egress proxy
// (org policy) - confirmed 2026-09-16, see the Dee repo's README.md
// Progress Log. The stopgap was a local snapshot script on a desktop, which
// only works while that specific machine is on. This relay is the real fix:
// it exposes Benzinga's Movers API as an MCP server, added to claude.ai as
// a custom connector exactly like the Robinhood connector. Connector traffic
// routes through Anthropic's own MCP proxy, which IS allowlisted from the
// sandbox - so this works regardless of which (if any) local device is on.
//
// The Benzinga API key lives server-side only (BENZINGA_API_KEY, set in
// Vercel's project environment variables) - it never reaches the caller.

import { NextRequest, NextResponse } from 'next/server'

const PROTOCOL_VERSION = '2025-06-18'
const SERVER_INFO = { name: 'benzinga-relay', version: '1.0.0' }

const TOOLS = [
  {
    name: 'get_market_movers',
    description:
      'Get live whole-market movers (biggest gainers and losers by percent change) from Benzinga. ' +
      'Use this to discover stocks making large moves right now, not just to look up symbols you already know - ' +
      'this is a whole-market screener, not a per-symbol quote lookup.',
    inputSchema: {
      type: 'object',
      properties: {
        session: {
          type: 'string',
          enum: ['PRE_MARKET', 'REGULAR', 'AFTER_MARKET'],
          description: 'Trading session to query. Defaults to REGULAR.',
        },
        maxResults: {
          type: 'integer',
          description: 'Max number of gainers and max number of losers to return (each side capped separately). Defaults to 50.',
        },
        from: {
          type: 'string',
          description: 'Optional start date/time (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS) for a historical window instead of the current session.',
        },
        to: {
          type: 'string',
          description: 'Optional end date/time (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS), paired with `from`.',
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

function jsonRpcResult(id: string | number | null | undefined, result: unknown) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, result })
}

function jsonRpcError(id: string | number | null | undefined, code: number, message: string) {
  return NextResponse.json(
    { jsonrpc: '2.0', id: id ?? null, error: { code, message } },
    { status: 200 } // JSON-RPC errors are still HTTP 200 - the error lives in the body
  )
}

async function callGetMarketMovers(args: Record<string, unknown>) {
  const apiKey = process.env.BENZINGA_API_KEY
  if (!apiKey) {
    throw new Error('BENZINGA_API_KEY is not configured on the server (Vercel project environment variables).')
  }

  const session = typeof args.session === 'string' ? args.session : 'REGULAR'
  const maxResults = typeof args.maxResults === 'number' ? args.maxResults : 50

  const url = new URL('https://api.benzinga.com/api/v1/market/movers')
  url.searchParams.set('token', apiKey)
  url.searchParams.set('session', session)
  url.searchParams.set('maxResults', String(maxResults))
  if (typeof args.from === 'string') url.searchParams.set('from', args.from)
  if (typeof args.to === 'string') url.searchParams.set('to', args.to)

  const res = await fetch(url.toString(), { method: 'GET' })
  const bodyText = await res.text()

  if (!res.ok) {
    throw new Error(`Benzinga returned HTTP ${res.status}: ${bodyText.slice(0, 500)}`)
  }

  return bodyText
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
      // Client notification, no response body expected for notifications.
      return new NextResponse(null, { status: 202 })

    case 'tools/list':
      return jsonRpcResult(id, { tools: TOOLS })

    case 'tools/call': {
      const toolName = params?.name as string | undefined
      const toolArgs = (params?.arguments as Record<string, unknown>) ?? {}

      if (toolName !== 'get_market_movers') {
        return jsonRpcError(id, -32602, `Unknown tool: ${toolName}`)
      }

      try {
        const resultText = await callGetMarketMovers(toolArgs)
        return jsonRpcResult(id, {
          content: [{ type: 'text', text: resultText }],
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
  // This relay is stateless request/response only - no server-initiated
  // streaming needed for a single read-only tool, so GET (used by some MCP
  // clients to open an SSE stream) is intentionally not supported.
  return new NextResponse(null, { status: 405 })
}
