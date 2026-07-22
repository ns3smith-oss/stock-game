'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { TickerSearch } from '@/components/simulator/TickerSearch'
import { DrawingToolbar, type DrawMode } from '@/components/simulator/DrawingToolbar'
import { SimOrderPanel, type Position, type Trade } from '@/components/simulator/SimOrderPanel'
import { SimTradeLog } from '@/components/simulator/SimTradeLog'
import { ChartLegend, type CrosshairInfo } from '@/components/simulator/ChartLegend'
import { calcEMA, etTimeToUTC, subtractTradingDays } from '@/lib/indicators'
import type { CandleData, DrawnLine, SimulatorChartHandle } from '@/components/simulator/SimulatorChart'

const SimulatorChart = dynamic(
  () => import('@/components/simulator/SimulatorChart').then((m) => m.SimulatorChart),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-[#787B86] text-sm">Loading chart…</div> }
)

const TIMEFRAMES = [
  { label: '1m',  timespan: 'minute', multiplier: '1'  },
  { label: '5m',  timespan: 'minute', multiplier: '5'  },
  { label: '15m', timespan: 'minute', multiplier: '15' },
  { label: '1H',  timespan: 'hour',   multiplier: '1'  },
  { label: '1D',  timespan: 'day',    multiplier: '1'  },
]

const DATE_RANGES = [
  { label: '1D', days: 0 },
  { label: '3D', days: 2 },
  { label: '1W', days: 4 },
  { label: '1M', days: 21 },
]

const SPEEDS = [1, 2, 5, 10] as const
type Speed = typeof SPEEDS[number]

const SESSION_TIMES = [
  { label: 'Pre', time: '04:00' },
  { label: 'Open', time: '09:30' },
  { label: 'Mid', time: '12:00' },
]

function lastTradingDay(): string {
  const d = new Date()
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() - 2)
  else if (day === 6) d.setDate(d.getDate() - 1)
  else d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function todayStr() { return new Date().toISOString().split('T')[0] }
function oneYearAgoStr() {
  const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d.toISOString().split('T')[0]
}

const DEFAULT_CASH = 25000

export default function SimulatorPage() {
  // ─── Chart state ───────────────────────────────────────────
  const [ticker, setTicker] = useState('AAPL')
  const [tickerName, setTickerName] = useState('Apple Inc.')
  const [date, setDate] = useState(lastTradingDay)
  const [tfIndex, setTfIndex] = useState(1)        // default 5m
  const [dateRangeIndex, setDateRangeIndex] = useState(0) // default 1D
  const [startTime, setStartTime] = useState('09:30') // ET start time for replay
  const [allCandles, setAllCandles] = useState<CandleData[]>([])
  const [visibleCount, setVisibleCount] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Drawing tools ─────────────────────────────────────────
  const [drawMode, setDrawMode] = useState<DrawMode>('cursor')
  const [drawnLines, setDrawnLines] = useState<DrawnLine[]>([])
  const [drawingsLocked, setDrawingsLocked] = useState(false)
  const [drawingsVisible, setDrawingsVisible] = useState(true)
  const [magnetMode, setMagnetMode] = useState<'off' | 'weak' | 'strong'>('off')

  // ─── Trading state ──────────────────────────────────────────
  const [cashBalance, setCashBalance] = useState(DEFAULT_CASH)
  const [position, setPosition] = useState<Position | null>(null)
  const [trades, setTrades] = useState<Trade[]>([])

  // ─── Account edit ───────────────────────────────────────────
  const [editingCash, setEditingCash] = useState(false)
  const [cashInput, setCashInput] = useState(String(DEFAULT_CASH))

  // ─── Crosshair legend ───────────────────────────────────────
  const [crosshairInfo, setCrosshairInfo] = useState<CrosshairInfo | null>(null)

  const chartRef = useRef<SimulatorChartHandle>(null)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tf = TIMEFRAMES[tfIndex]
  const dateRange = DATE_RANGES[dateRangeIndex]
  const visibleCandles = allCandles.slice(0, visibleCount)
  const currentPrice = visibleCandles.length > 0 ? visibleCandles[visibleCandles.length - 1].close : null

  // ─── EMA calculations (memoized from visible candles) ───────
  const emaData = useMemo(() => {
    const closes = allCandles.map((c) => c.close)
    return {
      ema9:   calcEMA(closes, 9).slice(0, visibleCount),
      ema20:  calcEMA(closes, 20).slice(0, visibleCount),
      ema200: calcEMA(closes, 200).slice(0, visibleCount),
    }
  }, [allCandles, visibleCount])

  // ─── Fetch candles ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setIsPlaying(false)
    setAllCandles([])
    setVisibleCount(0)

    const fromDate = tf.timespan === 'day'
      ? oneYearAgoStr()
      : dateRange.days === 0 ? date : subtractTradingDays(date, dateRange.days)

    fetch(`/api/candles?ticker=${ticker}&timespan=${tf.timespan}&multiplier=${tf.multiplier}&from=${fromDate}&to=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.error && !data.candles?.length) {
          setError(data.error)
          setLoading(false)
          return
        }
        const candles: CandleData[] = data.candles ?? []
        setAllCandles(candles)

        // Find start index based on selected ET start time
        if (tf.timespan !== 'day' && candles.length > 0) {
          const startUTC = etTimeToUTC(date, startTime)
          const idx = candles.findIndex((c) => c.time >= startUTC)
          const startIdx = idx >= 0 ? idx : 0
          // Show 30 bars ahead of start by default
          setVisibleCount(Math.min(startIdx + 30, candles.length))
        } else {
          setVisibleCount(candles.length)
        }
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError('Failed to load data')
        setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, date, tfIndex, dateRangeIndex])

  // ─── Replay interval ────────────────────────────────────────
  useEffect(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    if (!isPlaying || allCandles.length === 0) return

    playIntervalRef.current = setInterval(() => {
      setVisibleCount((c) => {
        const next = c + speed
        if (next >= allCandles.length) { setIsPlaying(false); return allCandles.length }
        return next
      })
    }, 500)

    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current) }
  }, [isPlaying, speed, allCandles.length])

  // ─── Drawing handlers ────────────────────────────────────────
  const handleLineAdded = useCallback((line: DrawnLine) => {
    if (drawingsLocked) return
    setDrawnLines((prev) => [...prev, line])
    setDrawMode('cursor')
  }, [drawingsLocked])

  // ─── Trade handlers ──────────────────────────────────────────
  const handleBuy = useCallback((shares: number) => {
    if (!currentPrice || shares <= 0) return
    const cost = shares * currentPrice
    if (cost > cashBalance) return
    setCashBalance((b) => b - cost)
    setPosition((p) => {
      if (!p) return { ticker, shares, avgEntry: currentPrice, side: 'long' }
      const total = p.shares + shares
      return { ...p, shares: total, avgEntry: (p.avgEntry * p.shares + currentPrice * shares) / total }
    })
  }, [currentPrice, cashBalance, ticker])

  const handleSell = useCallback((shares: number) => {
    if (!currentPrice || !position || shares <= 0) return
    const actual = Math.min(shares, position.shares)
    setCashBalance((b) => b + actual * currentPrice)
    setTrades((prev) => [...prev, {
      id: `t-${Date.now()}`,
      ticker,
      side: position.side,
      shares: actual,
      entry: position.avgEntry,
      exit: currentPrice,
      pnl: (currentPrice - position.avgEntry) * actual,
      time: Date.now(),
    }])
    setPosition((p) => !p ? null : p.shares - actual <= 0 ? null : { ...p, shares: p.shares - actual })
  }, [currentPrice, position, ticker])

  // ─── Account edit ────────────────────────────────────────────
  function applyNewBalance() {
    const val = parseFloat(cashInput.replace(/,/g, ''))
    if (!isNaN(val) && val > 0) {
      setCashBalance(val)
      setPosition(null)
      setTrades([])
    }
    setEditingCash(false)
  }

  // ─── Jump to time ────────────────────────────────────────────
  function jumpToTime(etTime: string) {
    setStartTime(etTime)
    if (allCandles.length === 0) return
    const startUTC = etTimeToUTC(date, etTime)
    const idx = allCandles.findIndex((c) => c.time >= startUTC)
    const startIdx = idx >= 0 ? idx : 0
    setVisibleCount(Math.min(startIdx + 30, allCandles.length))
    setIsPlaying(false)
  }

  const canStep = visibleCount < allCandles.length
  const lastCandle = visibleCandles.length > 0 ? visibleCandles[visibleCandles.length - 1] : null
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0)

  return (
    <div className="flex flex-col h-screen bg-[#131722] overflow-hidden text-white">

      {/* ── Top toolbar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 border-b border-[#2a2e39] bg-[#1e222d] shrink-0">

        {/* Back */}
        <Link href="/learn" className="text-[#787B86] hover:text-white text-xs transition-colors mr-1">← Back</Link>

        {/* Ticker */}
        <TickerSearch value={ticker} onChange={(t, name) => { setTicker(t); setTickerName(name) }} />

        {/* Timeframe */}
        <div className="flex gap-0.5">
          {TIMEFRAMES.map((t, i) => (
            <button key={t.label} onClick={() => setTfIndex(i)}
              className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${tfIndex === i ? 'bg-[#2a2e39] text-white' : 'text-[#787B86] hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Date */}
        <input type="date" value={date} min={oneYearAgoStr()} max={todayStr()}
          onChange={(e) => setDate(e.target.value)}
          className="bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-brand-purple" />

        {/* Session quick buttons */}
        <div className="flex gap-0.5">
          {SESSION_TIMES.map((s) => (
            <button key={s.time} onClick={() => jumpToTime(s.time)}
              className={`px-2 py-1 text-xs rounded transition-colors ${startTime === s.time ? 'bg-brand-purple/30 text-brand-purple border border-brand-purple/40' : 'text-[#787B86] hover:text-white'}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Custom time */}
        <input type="time" value={startTime} onChange={(e) => jumpToTime(e.target.value)}
          className="bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-brand-purple w-24" />
        <span className="text-[#787B86] text-[10px]">ET</span>

        <div className="w-px h-4 bg-white/10" />

        {/* Replay controls */}
        <div className="flex items-center gap-0.5">
          <button onClick={() => setVisibleCount((c) => Math.max(1, c - 1))} disabled={visibleCount <= 1}
            title="Step back"
            className="w-6 h-6 flex items-center justify-center text-[#787B86] hover:text-white disabled:opacity-30 text-xs rounded transition-colors">◀</button>
          <button onClick={() => setIsPlaying((p) => !p)} disabled={!canStep && !isPlaying}
            className={`w-6 h-6 flex items-center justify-center text-xs rounded transition-colors font-bold ${isPlaying ? 'text-red-400 bg-red-500/10' : 'text-green-400 bg-green-500/10'} disabled:opacity-30`}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={() => setVisibleCount((c) => Math.min(allCandles.length, c + 1))} disabled={!canStep}
            title="Step forward"
            className="w-6 h-6 flex items-center justify-center text-[#787B86] hover:text-white disabled:opacity-30 text-xs rounded transition-colors">▶</button>
        </div>

        {/* Speed */}
        <div className="flex gap-0.5">
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-colors ${speed === s ? 'bg-brand-purple text-white' : 'text-[#787B86] hover:text-white'}`}>
              {s}×
            </button>
          ))}
        </div>

        {/* Bar counter */}
        {allCandles.length > 0 && (
          <span className="text-[#787B86] text-[10px] ml-auto">{visibleCount}/{allCandles.length} bars</span>
        )}

        {/* Ticker name */}
        <span className="text-[#787B86] text-[10px] hidden lg:block">{tickerName}</span>
      </div>

      {/* ── Main area: tools | chart | order panel ─────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Drawing tools sidebar */}
        <DrawingToolbar
          activeTool={drawMode}
          onToolChange={(_toolId, dm) => setDrawMode(dm)}
          onDeleteAll={() => setDrawnLines([])}
          locked={drawingsLocked}
          onLockToggle={() => setDrawingsLocked((v) => !v)}
          visible={drawingsVisible}
          onVisibilityToggle={() => setDrawingsVisible((v) => !v)}
          magnetMode={magnetMode}
          onMagnetChange={setMagnetMode}
        />

        {/* Chart area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#131722]/80 z-20">
              <div className="text-[#787B86] text-sm animate-pulse">Loading {ticker}…</div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-2">
              <div className="text-red-400 text-sm">{error}</div>
              <div className="text-[#787B86] text-xs">Try a different ticker or date (markets closed on weekends)</div>
            </div>
          )}

          {/* OHLC + EMA legend overlay */}
          <div className="relative flex-1 overflow-hidden">
            <ChartLegend
              ticker={ticker}
              timeframeLabel={tf.label}
              info={crosshairInfo}
              lastCandle={lastCandle}
            />

            <SimulatorChart
              ref={chartRef}
              candles={visibleCandles}
              emaData={emaData}
              drawnLines={drawnLines}
              drawingMode={drawMode}
              onLineAdded={handleLineAdded}
              onCrosshairMove={setCrosshairInfo}
              drawingsVisible={drawingsVisible}
            />
          </div>

          {/* Bottom date range bar */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-t border-[#2a2e39] bg-[#1e222d] shrink-0">
            {DATE_RANGES.map((dr, i) => (
              <button key={dr.label} onClick={() => setDateRangeIndex(i)}
                className={`px-2.5 py-0.5 text-xs font-semibold rounded transition-colors ${dateRangeIndex === i ? 'bg-[#2a2e39] text-white' : 'text-[#787B86] hover:text-white'}`}>
                {dr.label}
              </button>
            ))}
            <div className="ml-auto text-[#787B86] text-[10px]">
              Charts by Polygon.io · Times in ET
            </div>
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────── */}
        <div className="w-56 shrink-0 flex flex-col border-l border-[#2a2e39] overflow-y-auto bg-[#131722]">

          {/* Account balance header */}
          <div className="px-3 py-2 border-b border-[#2a2e39]">
            {editingCash ? (
              <div className="flex items-center gap-1">
                <span className="text-[#787B86] text-xs">$</span>
                <input
                  autoFocus
                  type="number"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') applyNewBalance(); if (e.key === 'Escape') setEditingCash(false) }}
                  className="flex-1 bg-[#2a2e39] text-white text-xs px-2 py-1 rounded focus:outline-none"
                  min="100"
                />
                <button onClick={applyNewBalance} className="text-[10px] text-green-400 hover:text-green-300 font-bold px-1">✓</button>
                <button onClick={() => setEditingCash(false)} className="text-[10px] text-red-400 hover:text-red-300 font-bold px-1">✕</button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[#787B86] text-[10px] uppercase tracking-wide">Account</div>
                  <div className="text-white font-bold text-sm">
                    ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {totalPnL !== 0 && (
                    <div className={`text-xs font-semibold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      P&L: {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                    </div>
                  )}
                </div>
                <button onClick={() => { setCashInput(String(cashBalance)); setEditingCash(true) }}
                  className="text-[#787B86] hover:text-white transition-colors text-xs p-1"
                  title="Edit account balance">
                  ✏️
                </button>
              </div>
            )}
          </div>

          {/* Order panel */}
          <div className="p-2 flex-1">
            <SimOrderPanel
              ticker={ticker}
              currentPrice={currentPrice}
              cashBalance={cashBalance}
              position={position}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          </div>

          {/* Trade log */}
          <div className="p-2 border-t border-[#2a2e39]">
            <SimTradeLog trades={trades} totalPnL={totalPnL} />
          </div>
        </div>
      </div>
    </div>
  )
}
