'use client'

import { useState } from 'react'
import type { LiveCandidate, LiveScanMessage, LiveSource } from '@/app/api/scanner/live/route'

export interface LiveResult {
  asOfDate: string
  scannedTickers: number
  candidates: LiveCandidate[]
  source: LiveSource
  generatedAt?: string
}

interface ProgressState {
  dayNum: number; totalDays: number; currentDate: string; cached: boolean; cachedCount: number; liveCount: number
  scanning: boolean; tickerCount: number
}

function fmtVol(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

type SortKey = 'changePct' | 'todayRelVol' | 'gapPct'

interface Props { onResult: (r: LiveResult) => void }

export function LiveTab({ onResult }: Props) {
  const [minPrice,     setMinPrice]     = useState('1')
  const [maxPrice,     setMaxPrice]     = useState('20')
  const [minChangePct, setMinChangePct] = useState('10')
  const [minRelVol,    setMinRelVol]    = useState('3')

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [result,   setResult]   = useState<LiveResult | null>(null)
  const [progress, setProgress] = useState<ProgressState | null>(null)
  const [sortKey,  setSortKey]  = useState<SortKey>('changePct')
  const [sortDesc, setSortDesc] = useState(true)

  async function runScan() {
    setLoading(true); setError(null); setResult(null)
    setProgress({ dayNum: 0, totalDays: 6, currentDate: '', cached: true, cachedCount: 0, liveCount: 0, scanning: false, tickerCount: 0 })
    try {
      const params = new URLSearchParams({ minPrice, maxPrice, minChangePct, minRelVol })
      const res = await fetch(`/api/scanner/live?${params}`)
      if (!res.body) throw new Error('No stream')
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = ''
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          const msg: LiveScanMessage = JSON.parse(line)
          if (msg.type === 'progress') {
            setProgress(p => ({ ...p!, dayNum: msg.dayNum, totalDays: msg.totalDays, currentDate: msg.date, cached: msg.cached, cachedCount: msg.cached ? (p?.cachedCount ?? 0) + 1 : (p?.cachedCount ?? 0), liveCount: !msg.cached ? (p?.liveCount ?? 0) + 1 : (p?.liveCount ?? 0) }))
          } else if (msg.type === 'scanning') {
            setProgress(p => ({ ...p!, scanning: true, tickerCount: msg.tickerCount }))
          } else if (msg.type === 'result') {
            const r: LiveResult = { asOfDate: msg.asOfDate, scannedTickers: msg.scannedTickers, candidates: msg.candidates, source: msg.source, generatedAt: msg.generatedAt }
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

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDesc(d => !d)
    else { setSortKey(k); setSortDesc(true) }
  }

  const sorted = result
    ? [...result.candidates].sort((a, b) => {
        const v = { changePct: [a.changePct, b.changePct], todayRelVol: [a.todayRelVol, b.todayRelVol], gapPct: [a.gapPct, b.gapPct] } as Record<SortKey, number[]>
        const [av, bv] = v[sortKey]
        return sortDesc ? bv - av : av - bv
      })
    : []

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th className={`px-3 py-2 text-right cursor-pointer select-none hover:text-white transition-colors ${active ? 'text-white' : 'text-[#787B86]'}`} onClick={() => toggleSort(k)}>
        {label}{active ? (sortDesc ? ' ▼' : ' ▲') : ''}
      </th>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* What this is for */}
      <div className="mb-4 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">☀️</span>
          <div>
            <p className="text-white text-xs font-semibold mb-0.5">Run this the morning of your trading session</p>
            <p className="text-[#787B86] text-[11px] leading-relaxed">
              The Live Scanner looks for stocks that are <strong className="text-white">actually moving right now</strong> — big % change, high relative volume, gapping up. No pattern required. This is your real-time pulse on the market: which stocks have the momentum and volume to follow through on a move. Use it at the open to see what has the most activity, then cross-reference with your Setup watch list to find where both align.
            </p>
          </div>
        </div>
      </div>

      {/* Data source notice — Robinhood live overlay takes priority over the Polygon EOD notice once a result comes back */}
      {result?.source === 'robinhood-live' ? (
        <div className="flex items-start gap-2 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-lg px-3 py-2 mb-4 text-[11px] text-[#39FF14]">
          <span className="shrink-0 mt-0.5">🟢</span>
          <span><strong>Live via Robinhood</strong> — price and change% are real-time quotes{result.generatedAt ? ` as of ${new Date(result.generatedAt).toLocaleTimeString()}` : ''}. Candidate discovery still runs on Polygon&apos;s prior-day data (Robinhood has no market-wide screener), so this list is who was already active — today's price tells you if they're still moving.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-4 text-[11px] text-yellow-300">
          <span className="shrink-0 mt-0.5">⚡</span>
          <span><strong>End-of-day mode</strong> — showing previous trading day&apos;s top movers. Live intraday updates during market hours require a Polygon Starter plan ($29/mo), or a fresh Robinhood live-price snapshot. Upgrade and set <code className="bg-black/30 px-1 rounded">POLYGON_PLAN=starter</code> in <code className="bg-black/30 px-1 rounded">.env.local</code> to activate the paid-plan path.</span>
        </div>
      )}

      {/* Controls */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          {[['Min Price', minPrice, setMinPrice, '20'], ['Max Price', maxPrice, setMaxPrice, '20'], ['Min Change%', minChangePct, setMinChangePct, '24'], ['Min RVOL', minRelVol, setMinRelVol, '20']].map(([label, val, set, w]) => (
            <div key={label as string}>
              <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">{label as string}</label>
              <input type="number" value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)}
                className={`w-${w as string} bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple`} />
            </div>
          ))}
          <button onClick={runScan} disabled={loading} className="px-4 py-1.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors">
            {loading ? 'Scanning…' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {loading && progress && (
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-4 mb-4">
          {!progress.scanning ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white font-semibold">Fetching recent market data — day {progress.dayNum} of {progress.totalDays}</span>
                <span className="text-[10px] text-[#787B86]">{progress.cachedCount} cached · {progress.liveCount} live</span>
              </div>
              <div className="w-full bg-[#2a2e39] rounded-full h-2 mb-2">
                <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${(progress.dayNum / progress.totalDays) * 100}%`, background: progress.cached ? '#39FF14' : '#8B00FF' }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#787B86]">{progress.currentDate}</span>
                {progress.cached ? <span className="text-[10px] text-[#39FF14]">● cached</span> : <span className="text-[10px] text-brand-purple">● live (~12s)</span>}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-white">Filtering {progress.tickerCount.toLocaleString()} tickers for momentum…</span>
            </div>
          )}
        </div>
      )}

      {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

      {result && !loading && (
        <>
          <div className="flex flex-wrap gap-4 text-[10px] text-[#787B86] mb-3">
            <span>As of: <span className="text-white">{result.asOfDate}</span></span>
            <span>Scanned: <span className="text-white">{result.scannedTickers.toLocaleString()}</span> tickers</span>
            <span>Movers found: <span className="text-white">{result.candidates.length}</span></span>
          </div>

          {result.candidates.length === 0 ? (
            <div className="text-[#787B86] text-xs">No matches. Try lowering Min Change% or Min RVOL.</div>
          ) : (
            <div className="overflow-x-auto border border-[#2a2e39] rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1e222d] uppercase text-[10px] tracking-wide">
                    <th className="text-left px-3 py-2 text-[#787B86]">Ticker</th>
                    <th className="text-right px-3 py-2 text-[#787B86]">Price</th>
                    <SortTh label="Change%" k="changePct" />
                    <SortTh label="Gap%" k="gapPct" />
                    <SortTh label="RVOL" k="todayRelVol" />
                    <th className="text-right px-3 py-2 text-[#787B86]">Volume</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(c => (
                    <tr key={c.ticker} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                      <td className="px-3 py-2 font-bold">{c.ticker}</td>
                      <td className="px-3 py-2 text-right">${c.price.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${c.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>{c.changePct >= 0 ? '+' : ''}{c.changePct.toFixed(1)}%</td>
                      <td className={`px-3 py-2 text-right ${c.gapPct >= 5 ? 'text-green-400' : c.gapPct < 0 ? 'text-red-400' : 'text-[#787B86]'}`}>{c.gapPct >= 0 ? '+' : ''}{c.gapPct.toFixed(1)}%</td>
                      <td className={`px-3 py-2 text-right font-semibold ${c.todayRelVol >= 5 ? 'text-[#39FF14]' : c.todayRelVol >= 3 ? 'text-yellow-400' : 'text-white'}`}>{c.todayRelVol.toFixed(1)}×</td>
                      <td className="px-3 py-2 text-right text-[#787B86]">{fmtVol(c.volume)}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => openStudy(c.ticker, result.asOfDate)} className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap">View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap gap-4 mt-3 text-[10px] text-[#787B86]">
            <span><span className="text-[#39FF14]">Green RVOL</span> = 5×+ · <span className="text-yellow-400">Yellow</span> = 3–5×</span>
            <span>Change% = vs. prior close · Gap% = open vs. prior close</span>
          </div>
        </>
      )}

      {!result && !loading && !error && (
        <div className="text-[#787B86] text-xs space-y-1">
          <p>Scans for stocks making big moves on the most recent trading day — raw momentum with no pattern requirement.</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>Price ${minPrice}–${maxPrice} · Change {minChangePct}%+ · RVOL {minRelVol}×+</li>
            <li>No flag pattern required — pure momentum filter</li>
            <li>Sorted by largest % move</li>
          </ul>
          <p className="mt-2 text-[#4a4e5a]">Much faster than the Setup scan — only fetches 6 days of data.</p>
        </div>
      )}
    </div>
  )
}
