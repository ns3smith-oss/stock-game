// Stock price simulation: starts with hand-crafted prices (good narrative),
// then switches to a bounded random walk so the game never "runs out" of data.

import { SCRIPTED_PRICES, STOCK_DEFINITIONS } from './constants'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

// Returns the next price for a stock given the current history length and price.
// Uses scripted values first, then random walk with a slight upward bias.
export function getNextPrice(
  ticker: string,
  historyLength: number,
  currentPrice: number
): number {
  const scripted = SCRIPTED_PRICES[ticker]
  if (scripted && historyLength < scripted.length) {
    return scripted[historyLength]
  }

  // Slight upward bias: 0.48 instead of 0.5 means ~2% more up moves than down
  const delta = (Math.random() - 0.48) * 0.03
  const base = STOCK_DEFINITIONS.find((s) => s.ticker === ticker)?.basePrice ?? currentPrice
  return clamp(
    currentPrice * (1 + delta),
    base * 0.5,  // floor: never below half the base price
    base * 2.5   // ceiling: never more than 2.5× the base price
  )
}

// Returns the initial price history (first 10 scripted values) for a ticker.
export function initializePriceHistory(ticker: string): number[] {
  const scripted = SCRIPTED_PRICES[ticker]
  return scripted ? scripted.slice(0, 10) : [50]
}

// Round a price to 2 decimal places for clean display.
export function formatPrice(price: number): string {
  return price.toFixed(2)
}

// Determine if a price series is trending up, down, or flat overall.
export function getPriceTrend(prices: number[]): 'up' | 'down' | 'flat' {
  if (prices.length < 2) return 'flat'
  const first = prices[0]
  const last  = prices[prices.length - 1]
  if (last > first * 1.005) return 'up'
  if (last < first * 0.995) return 'down'
  return 'flat'
}
