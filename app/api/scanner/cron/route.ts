// Nightly cron: fetch the latest trading day's grouped data and cache it to KV.
// Vercel calls this via the schedule in vercel.json (weeknights at 9 PM ET / 01:00 UTC).
// Single call per run = no rate-limit issues even on the free Polygon plan.
// Running this nightly means user-triggered scans only read from KV — they complete in
// seconds with no live Polygon calls and no timeout risk.

import { NextRequest, NextResponse } from 'next/server'
import { fetchGroupedDay } from '../route'
import { subtractTradingDays } from '@/lib/indicators'

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export async function GET(req: NextRequest) {
  // Vercel automatically generates CRON_SECRET and sends it as "Authorization: Bearer <secret>"
  // when calling cron routes. Also accept it as a query param for manual backfill runs.
  const authHeader = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const querySecret = req.nextUrl.searchParams.get('secret')
  const secret = bearerToken ?? querySecret
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  // Fetch the last N uncached trading days (default 1 for nightly runs; pass ?days=30 to backfill)
  const daysToFetch = Math.min(parseInt(req.nextUrl.searchParams.get('days') ?? '1'), 30)
  const fetched: string[] = []
  const skipped: string[] = []

  let cursor = subtractTradingDays(todayStr(), 1)
  for (let i = 0; i < daysToFetch; i++) {
    const date = cursor
    const { data } = await fetchGroupedDay(date, apiKey)
    if (data.results && data.results.length > 0) {
      fetched.push(date)
    } else {
      skipped.push(date)
    }
    cursor = subtractTradingDays(cursor, 1)
  }

  return NextResponse.json({ fetched, skipped })
}
