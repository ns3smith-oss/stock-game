'use client'

import { formatPrice } from '@/lib/stockSimulator'

interface StockChartProps {
  prices: number[]
  ticker: string
  name: string
  emoji: string
  currentPrice: number
  priceChange: number
  priceChangePercent: number
}

export function StockChart({
  prices,
  ticker,
  name,
  emoji,
  currentPrice,
  priceChange,
  priceChangePercent,
}: StockChartProps) {
  const isUp = priceChange >= 0
  const color = isUp ? '#22C55E' : '#EF4444'

  // Build SVG polyline path from price array
  const WIDTH = 300
  const HEIGHT = 80
  const padX = 8
  const padY = 8

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const points = prices
    .map((p, i) => {
      const x = padX + (i / (prices.length - 1 || 1)) * (WIDTH - padX * 2)
      const y = HEIGHT - padY - ((p - min) / range) * (HEIGHT - padY * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="w-full px-4 pt-2 pb-1">
      {/* Stock name row */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji}</span>
        <div>
          <span className="text-white font-black text-lg">{ticker}</span>
          <span className="text-gray-400 text-sm ml-2">{name}</span>
        </div>
      </div>

      {/* Current price */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-4xl font-black text-white">${formatPrice(currentPrice)}</span>
        <span className={`text-base font-bold ${isUp ? 'text-success' : 'text-danger'}`}>
          {isUp ? '▲' : '▼'} ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(1)}%)
        </span>
      </div>

      {/* SVG sparkline */}
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-20"
        preserveAspectRatio="none"
      >
        {/* Gradient fill under the line */}
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Fill area */}
        <polygon
          points={`${points} ${WIDTH - padX},${HEIGHT} ${padX},${HEIGHT}`}
          fill="url(#chartFill)"
        />

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Dot at current price */}
        {prices.length > 0 && (() => {
          const lastX = padX + ((prices.length - 1) / (prices.length - 1 || 1)) * (WIDTH - padX * 2)
          const lastY = HEIGHT - padY - ((prices[prices.length - 1] - min) / range) * (HEIGHT - padY * 2)
          return (
            <circle cx={lastX} cy={lastY} r="4" fill={color} stroke="white" strokeWidth="1.5" />
          )
        })()}
      </svg>
    </div>
  )
}
