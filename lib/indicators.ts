export function calcEMA(closes: number[], period: number): (number | null)[] {
  if (closes.length === 0) return []

  const k = 2 / (period + 1)
  const result: (number | null)[] = new Array(Math.min(period - 1, closes.length)).fill(null)

  if (closes.length < period) return result

  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  result.push(ema)

  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k)
    result.push(ema)
  }

  return result
}

// Convert ET time string "HH:MM" on a given date to UTC Unix seconds
export function etTimeToUTC(dateStr: string, etTimeStr: string): number {
  // Use -04:00 (EDT, valid Mar–Nov). For Nov–Mar switch to -05:00.
  const isoStr = `${dateStr}T${etTimeStr}:00-04:00`
  return Math.floor(new Date(isoStr).getTime() / 1000)
}

// Subtract n trading days (Mon–Fri) from a date string YYYY-MM-DD
export function subtractTradingDays(dateStr: string, n: number): string {
  const d = new Date(dateStr)
  let count = 0
  while (count < n) {
    d.setDate(d.getDate() - 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) count++
  }
  return d.toISOString().split('T')[0]
}
