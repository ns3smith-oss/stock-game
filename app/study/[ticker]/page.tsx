'use client'

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ChartLegend, type CrosshairInfo } from '@/components/simulator/ChartLegend'
import { calcEMA, etTimeToUTC, subtractTradingDays } from '@/lib/indicators'
import type { CandleData, SimulatorChartHandle } from '@/components/simulator/SimulatorChart'
import type { HistoryResult } from '@/app/api/scanner/history/route'

const SimulatorChart = dynamic(
  () => import('@/components/simulator/SimulatorChart').then(m => m.SimulatorChart),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center text-[#787B86] text-sm">Loading…</div> }
)

// ── Constants ──────────────────────────────────────────────────────────────
const DAILY_TF  = { label: '1D',  timespan: 'day',    multiplier: '1' }
const INTRA_TFS = [
  { label: '1m',  timespan: 'minute', multiplier: '1'  },
  { label: '5m',  timespan: 'minute', multiplier: '5'  },
  { label: '15m', timespan: 'minute', multiplier: '15' },
  { label: '1H',  timespan: 'hour',   multiplier: '1'  },
]
const SPEEDS = [1, 2, 5, 10] as const
type Speed = typeof SPEEDS[number]

function lastTradingDay() {
  const d = new Date()
  const day = d.getDay()
  if (day === 0) d.setDate(d.getDate() - 2)
  else if (day === 6) d.setDate(d.getDate() - 1)
  else d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
}

function dateToUnix(dateStr: string) {
  return Math.floor(new Date(dateStr + 'T16:00:00Z').getTime() / 1000)
}

// ── Pane state ─────────────────────────────────────────────────────────────
interface PaneState {
  allCandles: CandleData[]
  visibleCount: number
  loading: boolean
  error: string | null
  isPlaying: boolean
  speed: Speed
  crosshair: CrosshairInfo | null
}

function defaultPane(): PaneState {
  return { allCandles: [], visibleCount: 0, loading: false, error: null, isPlaying: false, speed: 1, crosshair: null }
}

// ── Page wrapper ───────────────────────────────────────────────────────────
export default function StudyPage({ params }: { params: { ticker: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen bg-[#131722] text-[#787B86]">Loading…</div>}>
      <StudyPageInner ticker={params.ticker.toUpperCase()} />
    </Suspense>
  )
}

// ── Inner component ────────────────────────────────────────────────────────
function StudyPageInner({ ticker }: { ticker: string }) {
  const searchParams = useSearchParams()
  const initDate = searchParams.get('date') || lastTradingDay()

  // Currently focused date (drives both panes)
  const [focusDate, setFocusDate] = useState(initDate)

  // Daily pane
  const [daily, setDaily] = useState<PaneState>(defaultPane())
  const dailyRef = useRef<SimulatorChartHandle>(null)
  const dailyInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Intraday pane
  const [intraIdx, setIntraIdx] = useState(1)           // default 5m
  const [intra, setIntra] = useState<PaneState>(defaultPane())
  const intraRef = useRef<SimulatorChartHandle>(null)
  const intraInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // History panel
  const [history, setHistory] = useState<HistoryResult | null>(null)
  const [histLoading, setHistLoading] = useState(false)
  const [histError, setHistError] = useState<string | null>(null)

  const intraTf = INTRA_TFS[intraIdx]

  // ── EMA data (memoised) ──────────────────────────────────────────────────
  const dailyEma = useMemo(() => {
    const closes = daily.allCandles.map(c => c.close)
    const n = daily.visibleCount
    return { ema9: calcEMA(closes, 9).slice(0, n), ema20: calcEMA(closes, 20).slice(0, n), ema200: calcEMA(closes, 200).slice(0, n) }
  }, [daily.allCandles, daily.visibleCount])

  const intraEma = useMemo(() => {
    const closes = intra.allCandles.map(c => c.close)
    const n = intra.visibleCount
    return { ema9: calcEMA(closes, 9).slice(0, n), ema20: calcEMA(closes, 20).slice(0, n), ema200: calcEMA(closes, 200).slice(0, n) }
  }, [intra.allCandles, intra.visibleCount])

  const dailyVisible  = daily.allCandles.slice(0, daily.visibleCount)
  const intraVisible  = intra.allCandles.slice(0, intra.visibleCount)

  // ── Fetch helpers ────────────────────────────────────────────────────────
  async function fetchCandles(
    timespan: string, multiplier: string, from: string, to: string,
    set: React.Dispatch<React.SetStateAction<PaneState>>,
    afterLoad?: (candles: CandleData[]) => void
  ) {
    set(p => ({ ...p, loading: true, error: null }))
    try {
      const r = await fetch(`/api/candles?ticker=${ticker}&timespan=${timespan}&multiplier=${multiplier}&from=${from}&to=${to}`)
      const data = await r.json()
      const candles: CandleData[] = data.candles ?? []
      if (!candles.length && data.error) throw new Error(data.error)
      set(p => ({ ...p, allCandles: candles, visibleCount: candles.length, loading: false, isPlaying: false }))
      afterLoad?.(candles)
    } catch (e) {
      set(p => ({ ...p, loading: false, error: String(e) }))
    }
  }

  // ── Load daily pane (1 year of daily bars) ───────────────────────────────
  useEffect(() => {
    const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    const from = oneYearAgo.toISOString().split('T')[0]
    const to   = lastTradingDay()
    fetchCandles('day', '1', from, to, setDaily)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker])

  // ── Load intraday pane ───────────────────────────────────────────────────
  useEffect(() => {
    const from = intraTf.timespan === 'hour'
      ? subtractTradingDays(focusDate, 4)
      : focusDate
    fetchCandles(intraTf.timespan, intraTf.multiplier, from, focusDate, setIntra, (candles) => {
      if (intraTf.timespan !== 'day' && candles.length > 0) {
        const startUTC = etTimeToUTC(focusDate, '09:30')
        const idx = candles.findIndex(c => c.time >= startUTC)
        const startIdx = idx >= 0 ? idx : 0
        setIntra(p => ({ ...p, visibleCount: Math.min(startIdx + 30, candles.length) }))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, focusDate, intraIdx])

  // ── Scroll daily chart to focusDate when candles load ───────────────────
  useEffect(() => {
    if (!daily.allCandles.length) return
    const ts   = dateToUnix(focusDate)
    const day  = 86400
    // short timeout gives the chart a moment to render before scrolling
    const t = setTimeout(() => dailyRef.current?.setVisibleTimeRange(ts - 45 * day, ts + 15 * day), 100)
    return () => clearTimeout(t)
  }, [daily.allCandles, focusDate])

  // ── Load history panel ───────────────────────────────────────────────────
  useEffect(() => {
    setHistLoading(true)
    setHistError(null)
    fetch(`/api/scanner/history?ticker=${ticker}`)
      .then(r => r.json())
      .then((data: HistoryResult) => { setHistory(data); setHistLoading(false) })
      .catch(e => { setHistError(String(e)); setHistLoading(false) })
  }, [ticker])

  // ── Replay helpers ───────────────────────────────────────────────────────
  function startReplay(
    pane: PaneState,
    set: React.Dispatch<React.SetStateAction<PaneState>>,
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
  ) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (pane.visibleCount >= pane.allCandles.length) return
    set(p => ({ ...p, isPlaying: true }))
    intervalRef.current = setInterval(() => {
      set(p => {
        const next = p.visibleCount + p.speed
        if (next >= p.allCandles.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return { ...p, visibleCount: p.allCandles.length, isPlaying: false }
        }
        return { ...p, visibleCount: next }
      })
    }, 500)
  }

  function stopReplay(
    set: React.Dispatch<React.SetStateAction<PaneState>>,
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
  ) {
    if (intervalRef.current) clearInterval(intervalRef.current)
    set(p => ({ ...p, isPlaying: false }))
  }

  function stepPane(
    set: React.Dispatch<React.SetStateAction<PaneState>>,
    delta: number
  ) {
    set(p => {
      const next = Math.max(1, Math.min(p.allCandles.length, p.visibleCount + delta))
      return { ...p, visibleCount: next }
    })
  }

  // cleanup intervals on unmount
  useEffect(() => () => {
    if (dailyInterval.current) clearInterval(dailyInterval.current)
    if (intraInterval.current) clearInterval(intraInterval.current)
  }, [])

  // ── Select a history flag date ───────────────────────────────────────────
  const selectFlagDate = useCallback((dateStr: string) => {
    setFocusDate(dateStr)
    // intraday reload is handled by focusDate useEffect above
    // daily chart: just scroll (data already loaded)
    const ts  = dateToUnix(dateStr)
    const day = 86400
    setTimeout(() => dailyRef.current?.setVisibleTimeRange(ts - 45 * day, ts + 15 * day), 50)
  }, [])

  // ── Replay bar ───────────────────────────────────────────────────────────
  function ReplayBar({
    pane, set, intervalRef, label,
  }: {
    pane: PaneState
    set: React.Dispatch<React.SetStateAction<PaneState>>
    intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
    label: string
  }) {
    const atEnd = pane.visibleCount >= pane.allCandles.length
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e222d] border-t border-[#2a2e39] shrink-0">
        <span className="text-[10px] text-[#787B86] mr-1 font-semibold uppercase tracking-wide">{label}</span>

        {/* Step back */}
        <button onClick={() => { stopReplay(set, intervalRef); stepPane(set, -pane.speed) }}
          className="w-6 h-6 flex items-center justify-center text-[#787B86] hover:text-white transition-colors">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M3 3h1.5v4.3L13 3v10L4.5 8.7V13H3z"/>
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={() => pane.isPlaying ? stopReplay(set, intervalRef) : startReplay(pane, set, intervalRef)}
          disabled={atEnd && !pane.isPlaying}
          className="w-6 h-6 flex items-center justify-center rounded bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-40 transition-colors">
          {pane.isPlaying
            ? <svg viewBox="0 0 16 16" width="10" height="10" fill="white"><rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/></svg>
            : <svg viewBox="0 0 16 16" width="10" height="10" fill="white"><path d="M3 2l10 6-10 6z"/></svg>
          }
        </button>

        {/* Step forward */}
        <button onClick={() => { stopReplay(set, intervalRef); stepPane(set, pane.speed) }}
          className="w-6 h-6 flex items-center justify-center text-[#787B86] hover:text-white transition-colors">
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M13 3h-1.5v4.3L3 3v10l8.5-4.3V13H13z"/>
          </svg>
        </button>

        {/* Speed */}
        <div className="flex items-center gap-0.5 ml-1">
          {SPEEDS.map(s => (
            <button key={s}
              onClick={() => set(p => ({ ...p, speed: s }))}
              className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors ${pane.speed === s ? 'bg-brand-purple text-white' : 'text-[#787B86] hover:text-white'}`}>
              {s}×
            </button>
          ))}
        </div>

        <span className="text-[10px] text-[#787B86] ml-auto">
          {pane.visibleCount} / {pane.allCandles.length} bars
        </span>

        {/* Reset */}
        <button
          onClick={() => { stopReplay(set, intervalRef); set(p => ({ ...p, visibleCount: Math.min(30, p.allCandles.length) })) }}
          className="text-[10px] text-[#787B86] hover:text-white transition-colors ml-1">
          Reset
        </button>
      </div>
    )
  }

  // ── History panel ────────────────────────────────────────────────────────
  function HistoryPanel() {
    return (
      <div className="w-72 shrink-0 flex flex-col border-l border-[#2a2e39] bg-[#0d1117] overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2.5 border-b border-[#2a2e39]">
          <div className="flex items-baseline justify-between">
            <span className="text-white font-bold text-sm">{ticker}</span>
            {history && history.winRate !== null && (
              <span className={`text-xs font-bold ${history.winRate >= 60 ? 'text-[#39FF14]' : history.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {history.winRate}% win rate
              </span>
            )}
          </div>
          {history && (
            <div className="flex gap-2 mt-1 text-[10px]">
              <span className="text-green-400">▲ {history.breakouts} breakouts</span>
              <span className="text-red-400">▼ {history.failures} failed</span>
              <span className="text-[#787B86]">→ {history.neutral} neutral</span>
            </div>
          )}
        </div>

        {/* Flag label */}
        <div className="px-3 py-1.5 bg-[#1e222d] border-b border-[#2a2e39]">
          <span className="text-[10px] text-[#787B86] uppercase tracking-wide font-semibold">Flag History — click to study</span>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {histLoading && (
            <div className="flex items-center gap-2 px-3 py-4 text-[#787B86] text-xs">
              <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              Loading 1-year history…
            </div>
          )}
          {histError && <div className="px-3 py-3 text-red-400 text-xs">{histError}</div>}
          {history && history.flags.length === 0 && (
            <div className="px-3 py-3 text-[#787B86] text-xs">No flag patterns found in the past year.</div>
          )}
          {history?.flags.map((f, i) => {
            const isActive = focusDate === f.flagEndDate
            return (
              <button
                key={i}
                onClick={() => selectFlagDate(f.flagEndDate)}
                className={`w-full text-left px-3 py-2.5 border-b border-[#1e222d] transition-colors ${isActive ? 'bg-brand-purple/20 border-l-2 border-l-brand-purple' : 'hover:bg-[#1e222d]'}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`font-mono text-xs font-semibold ${isActive ? 'text-white' : 'text-[#787B86]'}`}>{f.flagEndDate}</span>
                  <span className={`text-[10px] font-bold ${
                    f.outcomeLabel === 'breakout' ? 'text-green-400' :
                    f.outcomeLabel === 'failed'   ? 'text-red-400'   : 'text-[#787B86]'
                  }`}>
                    {f.outcomeLabel === 'breakout' ? '▲' : f.outcomeLabel === 'failed' ? '▼' : '→'}{' '}
                    {f.outcomePct !== null ? `${f.outcomePct >= 0 ? '+' : ''}${f.outcomePct.toFixed(1)}%` : '—'}
                  </span>
                </div>
                <div className="flex gap-2 text-[10px] text-[#787B86]">
                  <span>Pole <span className="text-green-400">+{f.poleGainPct.toFixed(1)}%</span></span>
                  <span>RVOL <span className="text-white">{f.poleRelVol.toFixed(1)}×</span></span>
                  <span>Score <span className="text-white">{f.confidence.toFixed(0)}</span></span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer: open in simulator */}
        <div className="px-3 py-2 border-t border-[#2a2e39]">
          <a
            href={`/simulator?ticker=${ticker}&date=${focusDate}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-1.5 bg-brand-purple/20 hover:bg-brand-purple/40 text-brand-purple text-xs font-semibold rounded transition-colors border border-brand-purple/30"
          >
            Paper trade this setup →
          </a>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#131722] text-white overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-[#2a2e39] bg-[#131722] shrink-0">
        <Link href="/scanner" className="text-[#787B86] hover:text-white text-xs transition-colors">← Scanner</Link>
        <span className="text-white font-bold">{ticker}</span>
        <span className="text-[#787B86] text-xs">{focusDate}</span>

        {/* Intraday TF selector */}
        <div className="flex items-center gap-0.5 ml-3">
          <span className="text-[10px] text-[#787B86] mr-1">Intraday:</span>
          {INTRA_TFS.map((tf, i) => (
            <button key={tf.label} onClick={() => setIntraIdx(i)}
              className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-colors ${intraIdx === i ? 'bg-[#2a2e39] text-white' : 'text-[#787B86] hover:text-white'}`}>
              {tf.label}
            </button>
          ))}
        </div>

        {/* Date picker for manual navigation */}
        <input
          type="date"
          value={focusDate}
          onChange={e => { if (e.target.value) selectFlagDate(e.target.value) }}
          className="ml-2 bg-[#1e222d] border border-[#2a2e39] text-white text-xs px-2 py-1 rounded focus:outline-none focus:border-brand-purple"
        />

        <span className="ml-auto text-[10px] text-[#787B86]">Study Mode — data via Polygon.io</span>
      </div>

      {/* ── Main area: dual pane + history panel ─────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: dual pane charts ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* ── Daily pane (top, 45% height) ──────────────────────────── */}
          <div className="flex flex-col" style={{ height: '45%' }}>
            <div className="px-3 py-1 bg-[#0d1117] border-b border-[#2a2e39] flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-[#787B86] font-semibold uppercase tracking-wide">Daily · 1 Year</span>
              {daily.loading && <div className="w-2.5 h-2.5 border border-brand-purple border-t-transparent rounded-full animate-spin" />}
              {daily.error && <span className="text-red-400 text-[10px]">{daily.error}</span>}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <ChartLegend ticker={ticker} timeframeLabel="1D" info={daily.crosshair} lastCandle={dailyVisible.at(-1) ?? null} />
              <SimulatorChart
                ref={dailyRef}
                candles={dailyVisible}
                emaData={dailyEma}
                onCrosshairMove={info => setDaily(p => ({ ...p, crosshair: info }))}
              />
            </div>
            <ReplayBar pane={daily} set={setDaily} intervalRef={dailyInterval} label="Daily" />
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className="h-px bg-[#2a2e39] shrink-0" />

          {/* ── Intraday pane (bottom, 55% height) ────────────────────── */}
          <div className="flex flex-col" style={{ height: '55%' }}>
            <div className="px-3 py-1 bg-[#0d1117] border-b border-[#2a2e39] flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-[#787B86] font-semibold uppercase tracking-wide">
                {intraTf.label} · {focusDate}
              </span>
              {intra.loading && <div className="w-2.5 h-2.5 border border-brand-purple border-t-transparent rounded-full animate-spin" />}
              {intra.error && <span className="text-red-400 text-[10px]">{intra.error}</span>}
            </div>
            <div className="relative flex-1 overflow-hidden">
              <ChartLegend ticker={ticker} timeframeLabel={intraTf.label} info={intra.crosshair} lastCandle={intraVisible.at(-1) ?? null} />
              <SimulatorChart
                ref={intraRef}
                candles={intraVisible}
                emaData={intraEma}
                onCrosshairMove={info => setIntra(p => ({ ...p, crosshair: info }))}
              />
            </div>
            <ReplayBar pane={intra} set={setIntra} intervalRef={intraInterval} label="Intra" />
          </div>

        </div>

        {/* ── Right: history panel ─────────────────────────────────────── */}
        <HistoryPanel />

      </div>
    </div>
  )
}
