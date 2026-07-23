'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ScanCandidate {
  ticker: string
  price: number
  avgVolume: number
  poleStartDate: string
  poleEndDate: string
  poleGainPct: number
  poleRelVol: number
  flagStartDate: string
  flagDays: number
  flagRangePct: number
  retracePct: number
  volumeTrend: 'declining' | 'flat' | 'rising'
  confidence: number
}

interface ScanResponse {
  asOfDate: string
  scannedTickers: number
  daysWithData: number
  liveCallsMade: number
  plan: string
  candidates: ScanCandidate[]
  error?: string
}

function fmtVol(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

export default function ScannerPage() {
  const router = useRouter()
  const [minPrice, setMinPrice] = useState('1')
  const [maxPrice, setMaxPrice] = useState('20')
  const [minRelVol, setMinRelVol] = useState('2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResponse | null>(null)

  async function runScan() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ minPrice, maxPrice, minRelVol })
      const res = await fetch(`/api/scanner?${params.toString()}`)
      const data: ScanResponse = await res.json()
      if (!res.ok || data.error) {
        setError(data.error ?? 'Scan failed')
      } else {
        setResult(data)
      }
    } catch {
      setError('Failed to run scan')
    } finally {
      setLoading(false)
    }
  }

  function openInSimulator(ticker: string, asOfDate: string) {
    router.push(`/simulator?ticker=${ticker}&date=${asOfDate}`)
  }

  return (
    <div className="min-h-screen bg-[#131722] text-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39]">
        <Link href="/learn" className="text-[#787B86] hover:text-white text-sm transition-colors">← Back</Link>
        <h1 className="text-sm font-bold">Flag Scanner</h1>
        <span className="text-[10px] text-[#787B86]">Daily-bar flag setups · under $20 · high relative volume</span>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 mb-4">
          <div>
            <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Min Price</label>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              className="w-20 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
          </div>
          <div>
            <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Max Price</label>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              className="w-20 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
          </div>
          <div>
            <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Min Pole RVOL</label>
            <input type="number" step="0.5" value={minRelVol} onChange={(e) => setMinRelVol(e.target.value)}
              className="w-20 bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple" />
          </div>
          <button onClick={runScan} disabled={loading}
            className="px-4 py-1.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors">
            {loading ? 'Scanning…' : 'Run Scan'}
          </button>
          {loading && (
            <span className="text-[10px] text-[#787B86]">
              Free plan is rate-limited to 5 calls/min — a cold scan can take ~5–6 minutes. Cached days speed up future runs.
            </span>
          )}
        </div>

        {error && (
          <div className="text-red-400 text-xs mb-4">{error}</div>
        )}

        {result && !loading && (
          <>
            <div className="flex flex-wrap gap-4 text-[10px] text-[#787B86] mb-3">
              <span>As of: <span className="text-white">{result.asOfDate}</span></span>
              <span>Scanned: <span className="text-white">{result.scannedTickers.toLocaleString()}</span> tickers</span>
              <span>Matches: <span className="text-white">{result.candidates.length}</span></span>
              <span>Plan: <span className="text-white">{result.plan}</span></span>
              {result.liveCallsMade > 0 && <span>Live API calls this run: <span className="text-white">{result.liveCallsMade}</span></span>}
            </div>

            {result.candidates.length === 0 ? (
              <div className="text-[#787B86] text-xs">No flag setups found for these filters as of {result.asOfDate}.</div>
            ) : (
              <div className="overflow-x-auto border border-[#2a2e39] rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1e222d] text-[#787B86] uppercase text-[10px] tracking-wide">
                      <th className="text-left px-3 py-2">Ticker</th>
                      <th className="text-right px-3 py-2">Price</th>
                      <th className="text-right px-3 py-2">Avg Vol</th>
                      <th className="text-right px-3 py-2">Pole Gain</th>
                      <th className="text-right px-3 py-2">Pole RVOL</th>
                      <th className="text-right px-3 py-2">Flag Days</th>
                      <th className="text-right px-3 py-2">Flag Range</th>
                      <th className="text-right px-3 py-2">Retrace</th>
                      <th className="text-center px-3 py-2">Vol Trend</th>
                      <th className="text-right px-3 py-2">Confidence</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.candidates.map((c) => (
                      <tr key={c.ticker} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                        <td className="px-3 py-2 font-bold">{c.ticker}</td>
                        <td className="px-3 py-2 text-right">${c.price.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right text-[#787B86]">{fmtVol(c.avgVolume)}</td>
                        <td className="px-3 py-2 text-right text-green-400">+{c.poleGainPct.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{c.poleRelVol.toFixed(1)}×</td>
                        <td className="px-3 py-2 text-right">{c.flagDays}d</td>
                        <td className="px-3 py-2 text-right">{c.flagRangePct.toFixed(1)}%</td>
                        <td className="px-3 py-2 text-right">{c.retracePct.toFixed(0)}%</td>
                        <td className="px-3 py-2 text-center">
                          <span className={
                            c.volumeTrend === 'declining' ? 'text-green-400' :
                            c.volumeTrend === 'flat' ? 'text-yellow-400' : 'text-red-400'
                          }>{c.volumeTrend}</span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold">{c.confidence.toFixed(0)}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => openInSimulator(c.ticker, result.asOfDate)}
                            className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors">
                            View Chart →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {!result && !loading && !error && (
          <div className="text-[#787B86] text-xs">
            Run a scan to find stocks under ${maxPrice} with a high-volume pole move followed by a tightening, lower-volume flag consolidation.
          </div>
        )}
      </div>
    </div>
  )
}
