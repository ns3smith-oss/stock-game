'use client'

import type { CandleData } from './SimulatorChart'

export interface CrosshairInfo {
  candle: CandleData
  ema9: number | null
  ema20: number | null
  ema200: number | null
}

interface Props {
  ticker: string
  timeframeLabel: string
  info: CrosshairInfo | null
  lastCandle: CandleData | null
}

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—'
  return n.toFixed(decimals)
}

export function ChartLegend({ ticker, timeframeLabel, info, lastCandle }: Props) {
  const candle = info?.candle ?? lastCandle
  if (!candle) return null

  const change = candle.close - candle.open
  const changePct = (change / candle.open) * 100
  const isUp = change >= 0
  const color = isUp ? '#39FF14' : '#FF6B6B'

  return (
    <div className="absolute top-2 left-2 z-10 pointer-events-none select-none">
      {/* Ticker + OHLC row */}
      <div className="flex items-baseline gap-3 text-xs leading-snug">
        <span className="text-white font-bold text-sm">{ticker} · {timeframeLabel}</span>
        <span className="text-[#787B86]">O <span className="text-white">{fmt(candle.open)}</span></span>
        <span className="text-[#787B86]">H <span style={{ color: '#39FF14' }}>{fmt(candle.high)}</span></span>
        <span className="text-[#787B86]">L <span style={{ color: '#FF6B6B' }}>{fmt(candle.low)}</span></span>
        <span className="text-[#787B86]">C <span style={{ color }}>{fmt(candle.close)}</span></span>
        <span style={{ color }} className="font-semibold">
          {isUp ? '+' : ''}{fmt(change)} ({isUp ? '+' : ''}{fmt(changePct)}%)
        </span>
      </div>

      {/* Indicators */}
      <div className="flex gap-3 text-[11px] leading-snug mt-0.5">
        <span style={{ color: '#E0E0E0' }}>
          EMA 9 <span className="font-semibold">{fmt(info?.ema9)}</span>
        </span>
        <span style={{ color: '#A0A0A0' }}>
          EMA 20 <span className="font-semibold">{fmt(info?.ema20)}</span>
        </span>
        <span style={{ color: '#3B82F6' }}>
          EMA 200 <span className="font-semibold">{fmt(info?.ema200)}</span>
        </span>
        <span style={{ color: '#8B00FF' }}>
          VWAP <span className="font-semibold">{fmt(candle.vwap)}</span>
        </span>
      </div>
    </div>
  )
}
