import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticker = searchParams.get('ticker')?.toUpperCase()
  const timespan = searchParams.get('timespan') ?? 'minute'
  const multiplier = searchParams.get('multiplier') ?? '5'
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  if (!ticker || !from || !to) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 })
  }

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    const data = await res.json()

    if (!res.ok || !data.results) {
      return NextResponse.json({ error: data.error ?? 'No data returned', candles: [] }, { status: 200 })
    }

    const candles = data.results.map((r: {
      t: number; o: number; h: number; l: number; c: number; v: number; vw?: number
    }) => ({
      time: Math.floor(r.t / 1000) as number,
      open: r.o,
      high: r.h,
      low: r.l,
      close: r.c,
      volume: r.v,
      vwap: r.vw,
    }))

    return NextResponse.json({ candles })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
