import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.POLYGON_API_KEY
  const url = `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&market=stocks&limit=8&apiKey=${apiKey}`

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    const data = await res.json()

    const results = (data.results ?? []).map((r: { ticker: string; name: string }) => ({
      ticker: r.ticker,
      name: r.name,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
