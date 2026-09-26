// Shared plumbing for the /api/data/* relay: lets Dee's cloud routines pull Massive (Polygon)
// history through this server without ever holding POLYGON_API_KEY themselves.
//
// Auth: every request must carry `Authorization: Bearer <DATA_RELAY_TOKEN>`. If DATA_RELAY_TOKEN
// isn't configured the relay refuses everything (fails closed) - it spends a paid key, so it must
// never be open to the public the way the read-only app routes are.

import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

const POLYGON_ORIGIN = 'https://api.polygon.io'

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const TICKER_RE = /^[A-Z0-9.\-]{1,12}$/

function sameSecret(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}

/** Returns an error response if the request isn't allowed through, otherwise null. */
export function checkRelayAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.DATA_RELAY_TOKEN
  if (!expected) {
    return NextResponse.json({ error: 'Data relay disabled: DATA_RELAY_TOKEN is not configured' }, { status: 503 })
  }
  const auth = req.headers.get('authorization')
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token || !sameSecret(token, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!process.env.POLYGON_API_KEY) {
    return NextResponse.json({ error: 'POLYGON_API_KEY is not configured' }, { status: 500 })
  }
  return null
}

/**
 * Resolves a `next` pagination URL handed back to the caller on a previous page. Only Polygon
 * URLs under the expected path prefix are accepted, so the relay can't be turned into a
 * general-purpose proxy for the key.
 */
export function resolveNext(next: string | null, pathPrefix: string): URL | null {
  if (!next) return null
  let url: URL
  try { url = new URL(next) } catch { return null }
  if (url.origin !== POLYGON_ORIGIN || !url.pathname.startsWith(pathPrefix)) return null
  url.searchParams.delete('apiKey')
  return url
}

export function polygonUrl(path: string, params: Record<string, string> = {}) {
  const url = new URL(path, POLYGON_ORIGIN)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return url
}

type PolygonResult =
  | { ok: true; json: any }
  | { ok: false; response: NextResponse }

/** Fetches a Polygon URL with the server-side key attached. The key never appears in the response. */
export async function polygonFetch(url: URL): Promise<PolygonResult> {
  const withKey = new URL(url)
  withKey.searchParams.set('apiKey', process.env.POLYGON_API_KEY!)
  const res = await fetch(withKey, { cache: 'no-store' })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json || json.status === 'ERROR' || json.status === 'NOT_AUTHORIZED') {
    const message = json?.error ?? json?.message ?? `Polygon request failed (${res.status})`
    return { ok: false, response: NextResponse.json({ error: message, polygonStatus: res.status }, { status: res.ok ? 502 : res.status }) }
  }
  return { ok: true, json }
}

/** Polygon's next_url never includes the key, but strip it defensively before handing it out. */
export function publicNext(nextUrl: unknown): string | null {
  if (typeof nextUrl !== 'string') return null
  try {
    const u = new URL(nextUrl)
    u.searchParams.delete('apiKey')
    return u.toString()
  } catch {
    return null
  }
}
