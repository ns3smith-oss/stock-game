'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ScannerCandidate, ScanMessage } from '@/app/api/scanner/route'

interface ScanResult {
  asOfDate: string
  scannedTickers: number
  daysWithData: number
  liveCallsMade: number
  plan: string
  usingKV: boolean
  candidates: ScannerCandidate[]
}

interface ProgressState {
  phase: 'loading' | 'scanning' | 'enriching'
  dayNum: number
  totalDays: number
  currentDate: string
  cached: boolean
  cachedCount: number
  liveCount: number
  enrichStep: number
  enrichTotal: number
  enrichTicker: string
  tickerCount: number
}

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

function fmtFloat(v: number | null): string {
  if (v === null) return '—'
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

type SortKey = 'confidence' | 'changePct' | 'todayRelVol' | 'float' | 'poleGainPct'

export default function ScannerPage() {
  const router = useRouter()

  const [minPrice,     setMinPrice]     = useState('1')
  const [maxPrice,     setMaxPrice]     = useState('20')
  const [minRelVol,    setMinRelVol]    = useState('2')
  const [maxFloat,     setMaxFloat]     = useState('20')
  const [requireNews,  setRequireNews]  = useState(false)

  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [result,    setResult]    = useState<ScanResult | null>(null)
  const [progress,  setProgress]  = useState<ProgressState | null>(null)
  const [sortKey,   setSortKey]   = useState<SortKey>('confidence')
  const [sortDesc,  setSortDesc]  = useState(true)

  async function runScan() {
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress({
      phase: 'loading', dayNum: 0, totalDays: 30, currentDate: '',
      cached: true, cachedCount: 0, liveCount: 0,
      enrichStep: 0, enrichTotal: 0, enrichTicker: '', tickerCount: 0,
    })

    try {
      const params = new URLSearchParams({
        minPrice, maxPrice, minRelVol,
        maxFloat: maxFloat ? String(parseFloat(maxFloat) * 1_000_000) : 'Infinity',
        requireNews: String(requireNews),
      })

      const res = await fetch(`/api/scanner?${params.toString()}`)
      if (!res.body) throw new Error('No response stream')

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.trim()) continue
          const msg: ScanMessage = JSON.parse(line)

          if (msg.type === 'progress') {
            setProgress(prev => ({
              ...prev!,
              phase: 'loading',
              dayNum: msg.dayNum,
              totalDays: msg.totalDays,
              currentDate: msg.date,
              cached: msg.cached,
              cachedCount: msg.cached ? (prev?.cachedCount ?? 0) + 1 : (prev?.cachedCount ?? 0),
              liveCount:   !msg.cached ? (prev?.liveCount ?? 0) + 1 : (prev?.liveCount ?? 0),
            }))
          } else if (msg.type === 'scanning') {
            setProgress(prev => ({ ...prev!, phase: 'scanning', tickerCount: msg.tickerCount }))
          } else if (msg.type === 'enriching') {
            setProgress(prev => ({
              ...prev!,
              phase: 'enriching',
              enrichTicker: msg.ticker,
              enrichStep:   msg.step,
              enrichTotal:  msg.total,
            }))
          } else if (msg.type === 'result') {
            setResult(msg)
            setProgress(null)
          } else if (msg.type === 'error') {
            setError(msg.error)
            setProgress(null)
          }
        }
      }
    } catch (e) {
      setError(String(e))
      setProgress(null)
    } finally {
      setLoading(false)
    }
  }

  function openInSimulator(ticker: string, asOfDate: string) {
    router.push(`/simulator?ticker=${ticker}&date=${asOfDate}`)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
  }

  const sorted = result
    ? [...result.candidates].sort((a, b) => {
        let av = 0, bv = 0
        if (sortKey === 'confidence')  { av = a.confidence;  bv = b.confidence }
        if (sortKey === 'changePct')   { av = a.changePct;   bv = b.changePct }
        if (sortKey === 'todayRelVol') { av = a.todayRelVol; bv = b.todayRelVol }
        if (sortKey === 'poleGainPct') { av = a.poleGainPct; bv = b.poleGainPct }
        if (sortKey === 'float') { av = a.float ?? Infinity; bv = b.float ?? Infinity }
        return sortDesc ? bv - av : av - bv
      })
    : []

  function SortHeader({ label, k, right = true }: { label: string; k: SortKey; right?: boolean }) {
    const active = sortKey === k
    return (
      <th
        className={`px-3 py-2 cursor-pointer select-none hover:text-white transition-colors ${right ? 'text-right' : 'text-left'} ${active ? 'text-white' : 'text-[#787B86]'}`}
        onClick={() => toggleSort(k)}
      >
        {label}{active ? (sortDesc ? ' ▼' : ' ▲') : ''}
      </th>
    )
  }

  const hasEnrichment = result?.candidates.some(c => c.float !== null || c.hasNews)

  return (
    <div className="min-h-screen bg-[#131722] text-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39]">
        <Link href="/learn" className="text-[#787B86] hover:text-white text-sm transition-colors">← Back</Link>
        <h1 className="text-sm font-bold">Flag Scanner</h1>
        <span className="text-[10px] text-[#787B86]">Daily-bar flag setups · gap + RVOL momentum</span>
      </div>

      <div className="p-4 max-w-6xl mx-auto">

        {/* Controls */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 mb-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Min Price</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                className="w-20 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
            </div>
            <div>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Max Price</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                className="w-20 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
            </div>
            <div>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Min Pole RVOL</label>
              <input type="number" step="0.5" value={minRelVol} onChange={e => setMinRelVol(e.target.value)}
                className="w-24 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
            </div>
            <div>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Max Float (M)</label>
              <input type="number" step="5" value={maxFloat} onChange={e => setMaxFloat(e.target.value)}
                className="w-24 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-1.5">
              <div onClick={() => setRequireNews(!requireNews)}
                className={`w-9 h-5 rounded-full transition-colors relative ${requireNews ? 'bg-brand-purple' : 'bg-[#2a2e39]'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${requireNews ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-[10px] text-[#787B86] uppercase tracking-wide">Has News</span>
            </label>
            <button onClick={runScan} disabled={loading}
              className="px-4 py-1.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors">
              {loading ? 'Scanning…' : 'Run Scan'}
            </button>
          </div>
        </div>

        {/* Live progress indicator */}
        {loading && progress && (
          <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 mb-4">
            {progress.phase === 'loading' && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white font-semibold">
                    Loading trading data — day {progress.dayNum} of {progress.totalDays}
                  </span>
                  <span className="text-[10px] text-[#787B86]">
                    {progress.cachedCount} cached · {progress.liveCount} live
                  </span>
                </div>
                <div className="w-full bg-[#2a2e39] rounded-full h-2 mb-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(progress.dayNum / progress.totalDays) * 100}%`,
                      background: progress.cached ? '#39FF14' : '#8B00FF',
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#787B86]">
                    {progress.currentDate}
                  </span>
                  {progress.cached
                    ? <span className="text-[10px] text-[#39FF14]">● cached</span>
                    : <span className="text-[10px] text-brand-purple">● live API call (~12s)</span>
                  }
                  {progress.liveCount > 0 && (
                    <span className="text-[10px] text-[#787B86] ml-auto">
                      Est. remaining: ~{Math.round((progress.totalDays - progress.dayNum) * 12)}s
                    </span>
                  )}
                </div>
              </>
            )}

            {progress.phase === 'scanning' && (
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-white">
                  Running flag detection across {progress.tickerCount.toLocaleString()} tickers…
                </span>
              </div>
            )}

            {progress.phase === 'enriching' && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white font-semibold">
                    Enriching candidates with news + float
                  </span>
                  <span className="text-[10px] text-[#787B86]">
                    {progress.enrichStep} of {progress.enrichTotal}
                  </span>
                </div>
                <div className="w-full bg-[#2a2e39] rounded-full h-2 mb-2">
                  <div
                    className="h-2 bg-brand-purple rounded-full transition-all duration-300"
                    style={{ width: `${(progress.enrichStep / progress.enrichTotal) * 100}%` }}
                  />
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
              {result.liveCallsMade > 0 && <span>Live API calls: <span className="text-white">{result.liveCallsMade}</span></span>}
              {hasEnrichment && <span className="text-[#39FF14]">✓ News + float enriched</span>}
            </div>

            {result.candidates.length === 0 ? (
              <div className="text-[#787B86] text-xs">
                No matches as of {result.asOfDate}. Try lowering Min % Change or Min RVOL.
              </div>
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
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((c) => (
                      <tr key={c.ticker} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                        <td className="px-3 py-2 font-bold">{c.ticker}</td>
                        <td className="px-3 py-2 text-right">${c.price.toFixed(2)}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${c.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {c.changePct >= 0 ? '+' : ''}{c.changePct.toFixed(1)}%
                        </td>
                        <td className={`px-3 py-2 text-right ${c.gapPct >= 5 ? 'text-green-400' : c.gapPct < 0 ? 'text-red-400' : 'text-[#787B86]'}`}>
                          {c.gapPct >= 0 ? '+' : ''}{c.gapPct.toFixed(1)}%
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${c.todayRelVol >= 5 ? 'text-[#39FF14]' : c.todayRelVol >= 3 ? 'text-yellow-400' : 'text-white'}`}>
                          {c.todayRelVol.toFixed(1)}×
                        </td>
                        <td className={`px-3 py-2 text-right ${c.float !== null && c.float <= 20_000_000 ? 'text-[#39FF14]' : 'text-[#787B86]'}`}>
                          {fmtFloat(c.float)}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {c.hasNews
                            ? <span className="text-[#39FF14] font-bold">✓ {c.newsCount}</span>
                            : <span className="text-[#787B86]">—</span>
                          }
                        </td>
                        <td className="px-3 py-2 text-right text-green-400">+{c.poleGainPct.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right text-[#787B86]">{c.flagDays}d / {c.flagRangePct.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-center">
                          <span className={
                            c.volumeTrend === 'declining' ? 'text-green-400' :
                            c.volumeTrend === 'flat' ? 'text-yellow-400' : 'text-red-400'
                          }>{c.volumeTrend[0].toUpperCase()}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold">{c.confidence.toFixed(0)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => openInSimulator(c.ticker, result.asOfDate)}
                            className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[#787B86]">
              <span><span className="text-[#39FF14]">Green RVOL</span> = 5×+ · <span className="text-yellow-400">Yellow</span> = 3–5×</span>
              <span><span className="text-[#39FF14]">Green Float</span> = under 20M shares</span>
              <span>Vol = <span className="text-green-400">D</span>eclining / <span className="text-yellow-400">F</span>lat / <span className="text-red-400">R</span>ising (during flag)</span>
              <span>Gap% = pre-market open vs prior close · Float = shares outstanding (best free-plan proxy)</span>
            </div>
          </>
        )}

        {!result && !loading && !error && (
          <div className="text-[#787B86] text-xs space-y-1">
            <p>Scans the full market for stocks meeting all of these at once:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Price between ${minPrice} and ${maxPrice}</li>
              <li>Pole move with {minRelVol}×+ relative volume vs 10-day baseline</li>
              <li>Float under {maxFloat}M shares (micro-cap focus)</li>
              {requireNews && <li>Recent news circulating (reduces manipulation risk)</li>}
              <li>Tight flag consolidation after the pole (declining volume, small range)</li>
            </ul>
            <p className="mt-2 text-[#4a4e5a]">First run fetches ~30 days of data (~6 min on free API plan). Subsequent runs are instant from cache.</p>
          </div>
        )}
      </div>
    </div>
  )
}
