'use client'

// Drives live price updates for a stock. Ticks every 3 seconds.
// Keeps the last 30 price points so the chart never grows unbounded.

import { useState, useEffect, useRef } from 'react'
import { initializePriceHistory, getNextPrice } from '@/lib/stockSimulator'

const TICK_INTERVAL_MS = 3000
const MAX_HISTORY = 30

export function useStockTicker(ticker: string) {
  const [prices, setPrices] = useState<number[]>(() => initializePriceHistory(ticker))
  const pricesRef = useRef<number[]>(initializePriceHistory(ticker))

  // Keep ref in sync so the interval closure always has the latest prices
  useEffect(() => {
    pricesRef.current = prices
  }, [prices])

  useEffect(() => {
    // Re-seed when ticker changes
    const seed = initializePriceHistory(ticker)
    setPrices(seed)
    pricesRef.current = seed

    const id = setInterval(() => {
      const current = pricesRef.current
      const currentPrice = current[current.length - 1]
      const nextPrice = getNextPrice(ticker, current.length, currentPrice)
      const updated = [...current, nextPrice].slice(-MAX_HISTORY)
      pricesRef.current = updated
      setPrices(updated)
    }, TICK_INTERVAL_MS)

    return () => clearInterval(id)
  }, [ticker])

  const currentPrice = prices[prices.length - 1] ?? 0
  const previousPrice = prices[prices.length - 2] ?? currentPrice

  return {
    prices,
    currentPrice,
    priceChange: currentPrice - previousPrice,
    priceChangePercent: previousPrice ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0,
  }
}
