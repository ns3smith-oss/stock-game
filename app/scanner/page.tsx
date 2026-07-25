'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SetupTab, type SetupResult } from '@/components/scanner/SetupTab'
import { LiveTab,  type LiveResult  } from '@/components/scanner/LiveTab'
import { MatchesTab } from '@/components/scanner/MatchesTab'

type Tab = 'setups' | 'live' | 'matches'

export default function ScannerHub() {
  const [activeTab,    setActiveTab]    = useState<Tab>('setups')
  const [setupResult,  setSetupResult]  = useState<SetupResult | null>(null)
  const [liveResult,   setLiveResult]   = useState<LiveResult  | null>(null)

  const matchCount = (() => {
    if (!setupResult || !liveResult) return null
    const liveSet = new Set(liveResult.candidates.map(c => c.ticker))
    return setupResult.candidates.filter(c => liveSet.has(c.ticker)).length
  })()

  const tabs: { id: Tab; label: string; badge?: string }[] = [
    { id: 'setups',  label: 'Setups',  badge: setupResult ? String(setupResult.candidates.length) : undefined },
    { id: 'live',    label: 'Live',    badge: liveResult  ? String(liveResult.candidates.length)  : undefined },
    { id: 'matches', label: 'Matches', badge: matchCount !== null ? String(matchCount) : undefined },
  ]

  return (
    <div className="min-h-screen bg-[#131722] text-white">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#2a2e39]">
        <Link href="/learn" className="text-[#787B86] hover:text-white text-sm transition-colors">← Back</Link>
        <h1 className="text-sm font-bold">Scanner</h1>
        <span className="text-[10px] text-[#787B86]">Flag setups · Live momentum · Pattern + momentum matches</span>
      </div>

      {/* ── Tab nav ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0 border-b border-[#2a2e39] px-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === t.id
                ? 'text-white border-brand-purple'
                : 'text-[#787B86] border-transparent hover:text-white'
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                t.id === 'matches' && matchCount !== null && matchCount > 0
                  ? 'bg-[#39FF14]/20 text-[#39FF14]'
                  : 'bg-[#2a2e39] text-[#787B86]'
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}

        {/* Matches hint if both run */}
        {matchCount !== null && matchCount > 0 && activeTab !== 'matches' && (
          <button
            onClick={() => setActiveTab('matches')}
            className="ml-auto flex items-center gap-1.5 text-[10px] text-[#39FF14] font-semibold animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
            {matchCount} match{matchCount !== 1 ? 'es' : ''} found — view now
          </button>
        )}
      </div>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div className={activeTab === 'setups'  ? 'block' : 'hidden'}><SetupTab  onResult={setSetupResult} /></div>
      <div className={activeTab === 'live'    ? 'block' : 'hidden'}><LiveTab   onResult={setLiveResult}  /></div>
      <div className={activeTab === 'matches' ? 'block' : 'hidden'}><MatchesTab setupResult={setupResult} liveResult={liveResult} /></div>

    </div>
  )
}
