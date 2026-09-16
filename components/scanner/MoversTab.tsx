'use client'

import { useState } from 'react'
import type { MoverCandidate, MoversResult } from '@/app/api/movers/route'

function fmtVol(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return String(v)
}

function fmtCap(v: number | null) {
  if (v == null) return '—'
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${v.toLocaleString()}`
}

type Side = 'gainers' | 'losers'
type SortKey = 'changePercent' | 'volume' | 'price'

export function MoversTab() {
  const [session, setSession] = useState<'PRE_MARKET' | 'REGULAR' | 'AFTER_MARKET'>('REGULAR')
  const [side, setSide] = useState<Side>('gainers')
  const [sortKey, setSortKey] = useState<SortKey>('changePercent')
  const [sortDesc, setSortDesc] = useState(true)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<MoversResult | null>(null)

  async function runFetch() {
    setLoading(true); setError(null); setResult(null)
    try {
      const params = new URLSearchParams({ session, maxResults: '50' })
      const res = await fetch(`/api/movers?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
      setResult(json as MoversResult)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  function openStudy(ticker: string) {
    const today = new Date().toISOString().slice(0, 10)
    window.open(`/study/${ticker}?date=${today}`, '_blank', 'noopener,noreferrer')
  }

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDesc(d => !d)
    else { setSortKey(k); setSortDesc(true) }
  }

  const candidates: MoverCandidate[] = result ? (side === 'gainers' ? result.gainers : result.losers) : []
  const sorted = [...candidates].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey]
    return sortDesc ? bv - av : av - bv
  })

  function SortTh({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <th
        className={`px-3 py-2 text-right cursor-pointer select-none hover:text-white transition-colors ${active ? 'text-white' : 'text-[#787B86]'}`}
        onClick={() => toggleSort(k)}
      >
        {label}{active ? (sortDesc ? ' ▼' : ' ▲') : ''}
      </th>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* What this is for */}
      <div className="mb-4 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-lg shrink-0">📡</span>
          <div>
            <p className="text-white text-xs font-semibold mb-0.5">Live whole-market movers, via Benzinga</p>
            <p className="text-[#787B86] text-[11px] leading-relaxed">
              Unlike Setups and Live (which score stocks you already know to check), this discovers stocks
              making big moves <strong className="text-white">across the entire market right now</strong> —
              including names you&apos;ve never seen before. This is the same data source Dee (the trading agent)
              uses to find candidates.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] text-[#787B86] uppercase tracking-wide mb-1">Session</label>
            <select
              value={session}
              onChange={e => setSession(e.target.value as typeof session)}
              className="bg-[#2a2e39] border border-white/10 text-white text-xs px-2 py-1.5 rounded focus:outline-none focus:border-brand-purple"
            >
              <option value="PRE_MARKET">Pre-Market</option>
              <option value="REGULAR">Regular</option>
              <option value="AFTER_MARKET">After-Market</option>
            </select>
          </div>
          <button
            onClick={runFetch}
            disabled={loading}
            className="px-4 py-1.5 bg-brand-purple hover:bg-brand-purple/80 disabled:opacity-50 text-white text-xs font-semibold rounded transition-colors"
          >
            {loading ? 'Fetching…' : 'Fetch Movers'}
          </button>
        </div>
      </div>

      {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

      {result && !loading && (
        <>
          {/* Gainers/Losers toggle */}
          <div className="flex items-center gap-0 mb-3 border-b border-[#2a2e39]">
            {(['gainers', 'losers'] as Side[]).map(s => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={`px-4 py-2 text-xs font-semibold transition-colors border-b-2 ${
                  side === s ? 'text-white border-brand-purple' : 'text-[#787B86] border-transparent hover:text-white'
                }`}
              >
                {s === 'gainers' ? '▲ Gainers' : '▼ Losers'} ({result[s].length})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] text-[#787B86] mb-3">
            <span>Session: <span className="text-white">{result.session}</span></span>
            <span>Fetched: <span className="text-white">{new Date(result.fetchedAt).toLocaleTimeString()}</span></span>
          </div>

          {sorted.length === 0 ? (
            <div className="text-[#787B86] text-xs">No {side} returned for this session.</div>
          ) : (
            <div className="overflow-x-auto border border-[#2a2e39] rounded-lg">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1e222d] uppercase text-[10px] tracking-wide">
                    <th className="text-left px-3 py-2 text-[#787B86]">Ticker</th>
                    <th className="text-left px-3 py-2 text-[#787B86]">Company</th>
                    <SortTh label="Price" k="price" />
                    <SortTh label="Change%" k="changePercent" />
                    <SortTh label="Volume" k="volume" />
                    <th className="text-right px-3 py-2 text-[#787B86]">Mkt Cap</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(c => (
                    <tr key={c.symbol} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                      <td className="px-3 py-2 font-bold">{c.symbol}</td>
                      <td className="px-3 py-2 text-[#787B86] max-w-[200px] truncate">{c.companyName}</td>
                      <td className="px-3 py-2 text-right">${c.price.toFixed(2)}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${c.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {c.changePercent >= 0 ? '+' : ''}{c.changePercent.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right text-[#787B86]">{fmtVol(c.volume)}</td>
                      <td className="px-3 py-2 text-right text-[#787B86]">{fmtCap(c.marketCap)}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => openStudy(c.symbol)}
                          className="text-brand-purple hover:text-white text-[10px] font-semibold transition-colors whitespace-nowrap"
                        >
                          View →
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
        <div className="text-[#787B86] text-xs space-y-1">
          <p>Pulls the current session&apos;s biggest gainers and losers from across the whole market.</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>No price/volume filter applied — this is raw discovery, not a scored match</li>
            <li>Switch session to see pre-market or after-hours movers instead of regular session</li>
          </ul>
        </div>
      )}
    </div>
  )
}
