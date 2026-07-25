'use client'

import { useState, useCallback } from 'react'
import type { ScannerCandidate, ScanMessage } from '@/app/api/scanner/route'
import type { HistoryResult } from '@/app/api/scanner/history/route'

export interface SetupResult {
  asOfDate: string
  scannedTickers: number
  candidates: ScannerCandidate[]
}

interface ProgressState {
  phase: 'loading' | 'scanning' | 'enriching'
  dayNum: number; totalDays: number; currentDate: string; cached: boolean
  cachedCount: number; liveCount: number
  enrichStep: number; enrichTotal: number; enrichTicker: string
  tickerCount: number
}

function fmtFloat(v: number | null) {
  if (v === null) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

type SortKey = 'confidence' | 'changePct' | 'todayRelVol' | 'float' | 'poleGainPct'

interface Props { onResult: (r: SetupResult) => void }

export function SetupTab({ onResult }: Props) {
  const [minPrice,    setMinPrice]    = useState('1')
  const [maxPrice,    setMaxPrice]    = useState('20')
  const [minRelVol,   setMinRelVol]   = useState('2')
  const [maxFloat,    setMaxFloat]    = useState('20')
  const [requireNews, setRequireNews] = useState(false)

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [result,   setResult]   = useState<SetupResult | null>(null)
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [sortKey,  setSortKey]  = useState<SortKey>('confidence')
  const [sortDesc, setSortDesc] = useState(true)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)
  const [historyCache, setHistoryCache] = useState<Record<string, HistoryResult | 'loading' | 'error'>>({})

  const loadHistory = useCallback(async (ticker: string) => {
    if (historyCache[ticker]) {
      setExpandedTicker(prev => prev === ticker ? null : ticker)
      return
    }
    setExpandedTicker(ticker)
    setHistoryCache(prev => ({ ...prev, [ticker]: 'loading' }))
    try {
      const res = await fetch(`/api/scanner/history?ticker=${ticker}`)
      if (!res.ok) throw new Error(await res.text())
      const data: HistoryResult = await res.json()
      setHistoryCache(prev => ({ ...prev, [ticker]: data }))
    } catch {
      setHistoryCache(prev => ({ ...prev, [ticker]: 'error' }))
    }
  }, [historyCache])

  async function runScan() {
    setLoading(true); setError(null); setResult(null)
    setProgress({ phase: 'loading', dayNum: 0, totalDays: 30, currentDate: '', cached: true, cachedCount: 0, liveCount: 0, enrichStep: 0, enrichTotal: 0, enrichTicker: '', tickerCount: 0 })
    try {
      const params = new URLSearchParams({ minPrice, maxPrice, minRelVol, maxFloat: maxFloat ? String(parseFloat(maxFloat) * 1_000_000) : 'Infinity', requireNews: String(requireNews) })
      const res = await fetch(`/api/scanner?${params}`)
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const msg: ScanMessage = JSON.parse(line)
          if (msg.type === 'progress') {
            setProgress(p => ({ ...p!, phase: 'loading', dayNum: msg.dayNum, totalDays: msg.totalDays, currentDate: msg.date, cached: msg.cached, cachedCount: msg.cached ? (p?.cachedCount ?? 0) + 1 : (p?.cachedCount ?? 0), liveCount: !msg.cached ? (p?.liveCount ?? 0) + 1 : (p?.liveCount ?? 0) }))
          } else if (msg.type === 'scanning') {
            setProgress(p => ({ ...p!, phase: 'scanning', tickerCount: msg.tickerCount }))
          } else if (msg.type === 'enriching') {
            setProgress(p => ({ ...p!, phase: 'enriching', enrichTicker: msg.ticker, enrichStep: msg.step, enrichTotal: msg.total }))
          } else if (msg.type === 'result') {
            const r: SetupResult = { asOfDate: msg.asOfDate, scannedTickers: msg.scannedTickers, candidates: msg.candidates }
            setResult(r); onResult(r); setProgress(null)
          } else if (msg.type === 'error') {
            setError(msg.error); setProgress(null)
          }
        }
      }
    } catch (e) { setError(String(e)); setProgress(null) }
    finally { setLoading(false) }
  }

  function openStudy(ticker: string, date: string) {
    window.open(`/study/${ticker}?date=${date}`, '_blank', 'noopener,noreferrer')
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
  }

  const sorted = result
    ? [...result.candidates].sort((a, b) => {
        const vals: Record<SortKey, [number, number]> = {
          confidence:  [a.confidence,  b.confidence],
          changePct:   [a.changePct,   b.changePct],
          todayRelVol: [a.todayRelVol, b.todayRelVol],
          poleGainPct: [a.poleGainPct, b.poleGainPct],
          float:       [a.float ?? Infinity, b.float ?? Infinity],
        }
        const [av, bv] = vals[sortKey]
        return sortDesc ? bv - av : av - bv
      })
    : []

  function SortHeader({ label, k, right = true }: { label: string; k: SortKey; right?: boolean }) {
    const active = sortKey === k
    return (
      <th className={`px-3 py-2 cursor-pointer select-none hover:text-white transition-colors ${right ? 'text-right' : 'text-left'} ${active ? 'text-white' : 'text-[#787B86]'}`}
        onClick={() => toggleSort(k)}>
        {label}{active ? (sortDesc ? ' ▼' : ' ▲') : ''}
      </th>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* What this is for */}
      <div className="mb-4 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">🌙</span>
          <div>
            <p className="text-white text-xs font-semibold mb-0.5">Run this the night before you trade</p>
            <p className="text-[#787B86] text-[11px] leading-relaxed">
              The Setup Scanner looks across the entire market for stocks that formed a <strong className="text-white">flag consolidation pattern</strong> — a sharp high-volume pole move followed by a tight, low-volume pullback. These are potential breakout candidates for the next trading day. Run it the evening before, study the results, and build your watch list so you already know what you&apos;re looking for before the market opens.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          {[['Min Price', minPrice, setMinPrice, '20', 'number'], ['Max Price', maxPrice, setMaxPrice, '20', 'number'], ['Min Pole RVOL', minRelVol, setMinRelVol, '24', 'number'], ['Max Float (M)', maxFloat, setMaxFloat, '24', 'number']].map(([label, val, set, w]) => (
            <div key={label as string}>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">{label as string}</label>
              <input type="number" value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)}
                className={`w-${w as string} bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple`} />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer pb-1.5">
            <div onClick={() => setRequireNews(!requireNews)} className={`w-9 h-5 rounded-full transition-colors relative ${requireNews ? 'bg-brand-purple' : 'bg-[#2a2e39]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${requireNews ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-[10px] text-[#787B86] uppercase tracking-wide">Has News</span>
          </label>
          <button onClick={runScan} disabled={loading} className="px-4 py-1.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors">
            {loading ? 'Scanning…' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {loading && progress && (
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 mb-4">
          {progress.phase === 'loading' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-semibold">Loading trading data — day {progress.dayNum} of {progress.totalDays}</span>
                <span className="text-[10px] text-[#787B86]">{progress.cachedCount} cached · {progress.liveCount} live</span>
              </div>
              <div className="w-full bg-[#2a2e39] rounded-full h-2 mb-2">
                <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${(progress.dayNum / progress.totalDays) * 100}%`, background: progress.cached ? '#39FF14' : '#8B00FF' }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#787B86]">{progress.currentDate}</span>
                {progress.cached ? <span className="text-[10px] text-[#39FF14]">● cached</span> : <span className="text-[10px] text-brand-purple">● live (~12s)</span>}
                {progress.liveCount > 0 && <span className="text-[10px] text-[#787B86] ml-auto">Est. remaining: ~{Math.round((progress.totalDays - progress.dayNum) * 12)}s</span>}
              </div>
            </>
          )}
          {progress.phase === 'scanning' && (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-white">Running flag detection across {progress.tickerCount.toLocaleString()} tickers…</span>
            </div>
          )}
          {progress.phase === 'enriching' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-semibold">Enriching with news + float</span>
                <span className="text-[10px] text-[#787B86]">{progress.enrichStep} of {progress.enrichTotal}</span>
              </div>
              <div className="w-full bg-[#2a2e39] rounded-full h-2 mb-2">
                <div className="h-2 bg-brand-purple rounded-full transition-all" style={{ width: `${(progress.enrichStep / progress.enrichTotal) * 100}%` }} />
              </div>
              <span className="text-[10px] text-[#787B86]">Checking {progress.enrichTicker}…</span>
            </>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

      {result && !loading && (
        <>
          <div className="flex flex-wrap gap-4 text-[10px] text-[#787B86] mb-3">
            <span>As of: <span className="text-white">{result.asOfDate}</span></span>
            <span>Scanned: <span className="text-white">{result.scannedTickers.toLocaleString()}</span> tickers</span>
            <span>Matches: <span className="text-white">{result.candidates.length}</span></span>
          </div>

          {result.candidates.length === 0 ? (
            <div className="text-[#787B86] text-xs">No matches. Try lowering Min Pole RVOL or Max Float.</div>
          ) : (
            <div className="overflow-x-auto border border-[#2a2e39] rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1e222d] uppercase text-[10px] tracking-wide">
                    <SortHeader label="Ticker" k="changePct" right={false} />
                    <th className="text-right px-3 py-2 text-[#787B86]">Price</th>
                    <SortHeader label="Change%" k="changePct" />
                    <th className="text-right px-3 py-2 text-[#787B86]">Gap%</th>
                    <SortHeader label="RVOL" k="todayRelVol" />
                    <SortHeader label="Float" k="float" />
                    <th className="text-center px-3 py-2 text-[#787B86]">News</th>
                    <SortHeader label="Pole" k="poleGainPct" />
                    <th className="text-right px-3 py-2 text-[#787B86]">Flag</th>
                    <th className="text-center px-3 py-2 text-[#787B86]">Vol</th>
                    <SortHeader label="Score" k="confidence" />
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(c => {
                    const isExpanded = expandedTicker === c.ticker
                    const hist = historyCache[c.ticker]
                    return (
                      <>
                        <tr key={c.ticker} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                          <td className="px-3 py-2 font-bold">{c.ticker}</td>
                          <td className="px-3 py-2 text-right">${c.price.toFixed(2)}</td>
                          <td className={`px-3 py-2 text-right font-semibold ${c.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{c.changePct >= 0 ? '+' : ''}{c.changePct.toFixed(1)}%</td>
                          <td className={`px-3 py-2 text-right ${c.gapPct >= 5 ? 'text-green-400' : c.gapPct < 0 ? 'text-red-400' : 'text-[#787B86]'}`}>{c.gapPct >= 0 ? '+' : ''}{c.gapPct.toFixed(1)}%</td>
                          <td className={`px-3 py-2 text-right font-semibold ${c.todayRelVol >= 5 ? 'text-[#39FF14]' : c.todayRelVol >= 3 ? 'text-yellow-400' : 'text-white'}`}>{c.todayRelVol.toFixed(1)}×</td>
                          <td className={`px-3 py-2 text-right ${c.float !== null && c.float <= 20_000_000 ? 'text-[#39FF14]' : 'text-[#787B86]'}`}>{fmtFloat(c.float)}</td>
                          <td className="px-3 py-2 text-center">{c.hasNews ? <span className="text-[#39FF14] font-bold">✓ {c.newsCount}</span> : <span className="text-[#787B86]">—</span>}</td>
                          <td className="px-3 py-2 text-right text-green-400">+{c.poleGainPct.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-right text-[#787B86]">{c.flagDays}d / {c.flagRangePct.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-center">
                            <span className={c.volumeTrend === 'declining' ? 'text-green-400' : c.volumeTrend === 'flat' ? 'text-yellow-400' : 'text-red-400'}>{c.volumeTrend[0].toUpperCase()}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-bold">{c.confidence.toFixed(0)}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button onClick={() => openStudy(c.ticker, result.asOfDate)} className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap">View →</button>
                              <button onClick={() => loadHistory(c.ticker)} className={`text-[10px] font-semibold transition-colors whitespace-nowrap ${isExpanded ? 'text-white' : 'text-[#787B86] hover:text-white'}`}>{isExpanded ? 'History ▲' : 'History ▼'}</button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${c.ticker}-hist`} className="border-t border-[#2a2e39] bg-[#0d1117]">
                            <td colSpan={12} className="px-4 py-3">
                              {hist === 'loading' && <div className="flex items-center gap-2 text-[#787B86] text-xs py-1"><div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />Loading 1-year flag history…</div>}
                              {hist === 'error' && <span className="text-red-400 text-xs">Failed to load history.</span>}
                              {hist && hist !== 'loading' && hist !== 'error' && (() => {
                                const h = hist as HistoryResult
                                return (
                                  <div>
                                    <div className="flex flex-wrap items-center gap-4 mb-3 text-[10px]">
                                      <span className="text-white font-bold">{h.ticker} — Past Year Flag History</span>
                                      <span className="text-[#787B86]">{h.flags.length} patterns</span>
                                      <span className="text-green-400">▲ {h.breakouts}</span>
                                      <span className="text-red-400">▼ {h.failures}</span>
                                      <span className="text-[#787B86]">→ {h.neutral}</span>
                                      {h.winRate !== null && <span className={`font-bold ${h.winRate >= 60 ? 'text-[#39FF14]' : h.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>Win rate: {h.winRate}%</span>}
                                    </div>
                                    {h.flags.length === 0 ? <span className="text-[#787B86] text-xs">No patterns in past year.</span> : (
                                      <table className="w-full text-[11px]">
                                        <thead><tr className="text-[#787B86] uppercase text-[9px] tracking-wide">
                                          <th className="text-left pb-1.5 pr-4">Flag End</th>
                                          <th className="text-right pr-4">Pole Gain</th>
                                          <th className="text-right pr-4">RVOL</th>
                                          <th className="text-right pr-4">Range</th>
                                          <th className="text-right pr-4">Score</th>
                                          <th className="text-center pr-4">Outcome</th>
                                          <th className="text-right pr-4">5-Day Move</th>
                                          <th className="text-left">Chart</th>
                                        </tr></thead>
                                        <tbody>
                                          {h.flags.map((f, i) => (
                                            <tr key={i} className={`border-t border-[#1e222d] ${i % 2 === 0 ? '' : 'bg-[#131722]/40'}`}>
                                              <td className="py-1.5 pr-4 text-white font-mono">{f.flagEndDate}</td>
                                              <td className="py-1.5 pr-4 text-right text-green-400">+{f.poleGainPct.toFixed(1)}%</td>
                                              <td className="py-1.5 pr-4 text-right text-[#787B86]">{f.poleRelVol.toFixed(1)}×</td>
                                              <td className="py-1.5 pr-4 text-right text-[#787B86]">{f.flagRangePct.toFixed(1)}%</td>
                                              <td className="py-1.5 pr-4 text-right font-bold text-white">{f.confidence.toFixed(0)}</td>
                                              <td className="py-1.5 pr-4 text-center">
                                                {f.outcomeLabel === 'breakout' && <span className="text-green-400 font-bold">▲ Breakout</span>}
                                                {f.outcomeLabel === 'failed'   && <span className="text-red-400 font-bold">▼ Failed</span>}
                                                {f.outcomeLabel === 'neutral'  && <span className="text-[#787B86]">→ Neutral</span>}
                                              </td>
                                              <td className="py-1.5 pr-4 text-right">{f.outcomePct !== null ? <span className={f.outcomePct >= 0 ? 'text-green-400' : 'text-red-400'}>{f.outcomePct >= 0 ? '+' : ''}{f.outcomePct.toFixed(1)}%</span> : <span className="text-[#787B86]">—</span>}</td>
                                              <td className="py-1.5"><button onClick={() => openStudy(c.ticker, f.flagEndDate)} className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors">Study →</button></td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    )}
                                  </div>
                                )
                              })()}
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[#787B86]">
            <span><span className="text-[#39FF14]">Green RVOL</span> = 5×+ · <span className="text-yellow-400">Yellow</span> = 3–5×</span>
            <span><span className="text-[#39FF14]">Green Float</span> = under 20M shares</span>
            <span>Vol = <span className="text-green-400">D</span>eclining / <span className="text-yellow-400">F</span>lat / <span className="text-red-400">R</span>ising (during flag)</span>
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <div className="text-[#787B86] text-xs space-y-1">
          <p>Scans the full market for stocks forming flag consolidation patterns — potential breakout setups for the next trading day.</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Price ${minPrice}–${maxPrice} · Pole RVOL {minRelVol}×+ · Float under {maxFloat}M</li>
            {requireNews && <li>Recent news required</li>}
            <li>Tight flag consolidation after the pole (declining volume, small range)</li>
          </ul>
          <p className="mt-2 text-[#4a4e5a]">First run ~6 min on free API plan. Subsequent runs instant from cache.</p>
        </div>
      )}
    </div>
  )
}
