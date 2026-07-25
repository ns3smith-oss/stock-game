'use client'

import type { SetupResult } from './SetupTab'
import type { LiveResult } from './LiveTab'

interface Props {
  setupResult: SetupResult | null
  liveResult: LiveResult | null
}

export function MatchesTab({ setupResult, liveResult }: Props) {
  const setupReady = setupResult !== null
  const liveReady  = liveResult  !== null

  function openStudy(ticker: string, date: string) {
    window.open(`/study/${ticker}?date=${date}`, '_blank', 'noopener,noreferrer')
  }

  const howToUse = (
    <div className="mb-4 p-3 bg-[#1e222d] border border-[#2a2e39] rounded-lg">
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">🎯</span>
        <div>
          <p className="text-white text-xs font-semibold mb-0.5">Your highest-conviction plays — check this last</p>
          <p className="text-[#787B86] text-[11px] leading-relaxed">
            The Matches tab finds stocks that appear on <strong className="text-white">both</strong> scanners — a flag pattern identified the night before <em>and</em> confirmed momentum the next morning. These are not just a pattern or just a mover: they are <strong className="text-white">both at once</strong>. Run Setup first (night before), run Live second (morning of), then come here. <strong className="text-white">These 2–3 stocks are your watch list for the day.</strong>
          </p>
        </div>
      </div>
    </div>
  )

  // ── Not enough data yet ──────────────────────────────────────────────────
  if (!setupReady || !liveReady) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        {howToUse}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-6 text-center">
          <div className="text-2xl mb-3">🎯</div>
          <h2 className="text-white font-bold text-sm mb-2">Run both scanners to find matches</h2>
          <p className="text-[#787B86] text-xs max-w-md mx-auto mb-4">
            Matches are stocks that formed a flag setup <em>and</em> are also showing high momentum.
            These are your highest-conviction plays — the pattern was identified in advance and the market is now confirming it.
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <div className={`flex items-center gap-2 ${setupReady ? 'text-[#39FF14]' : 'text-[#787B86]'}`}>
              <span className={`w-2 h-2 rounded-full ${setupReady ? 'bg-[#39FF14]' : 'bg-[#2a2e39]'}`} />
              Setup Scanner {setupReady ? '✓ done' : '— not run yet'}
            </div>
            <div className={`flex items-center gap-2 ${liveReady ? 'text-[#39FF14]' : 'text-[#787B86]'}`}>
              <span className={`w-2 h-2 rounded-full ${liveReady ? 'bg-[#39FF14]' : 'bg-[#2a2e39]'}`} />
              Live Scanner {liveReady ? '✓ done' : '— not run yet'}
            </div>
          </div>
          <p className="text-[#4a4e5a] text-[11px] mt-4">Go to the Setup and Live tabs and run both scans, then come back here.</p>
        </div>
      </div>
    )
  }

  // ── Compute matches ──────────────────────────────────────────────────────
  const liveByTicker = new Map(liveResult.candidates.map(c => [c.ticker, c]))
  const matches = setupResult.candidates
    .filter(c => liveByTicker.has(c.ticker))
    .map(setup => ({ setup, live: liveByTicker.get(setup.ticker)! }))
    .sort((a, b) => b.setup.confidence - a.setup.confidence)

  const setupDate = setupResult.asOfDate
  const liveDate  = liveResult.asOfDate
  const sameDayAsSetup = setupDate === liveDate

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {howToUse}
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div>
          <h2 className="text-white font-bold text-sm">Pattern + Momentum Matches</h2>
          <p className="text-[#787B86] text-[11px] mt-0.5">
            Setup scan: <span className="text-white">{setupDate}</span>
            {' · '}
            Live scan: <span className="text-white">{liveDate}</span>
            {sameDayAsSetup && <span className="text-yellow-400 ml-2">⚠ Same day — best matches are setup date N, live date N+1</span>}
          </p>
        </div>
        <div className={`ml-auto text-right`}>
          <div className={`text-2xl font-bold ${matches.length > 0 ? 'text-[#39FF14]' : 'text-[#787B86]'}`}>{matches.length}</div>
          <div className="text-[10px] text-[#787B86]">
            of {setupResult.candidates.length} setups matched {liveResult.candidates.length} movers
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-lg px-3 py-2 mb-4 text-[11px] text-[#a78bfa]">
        💡 <strong>Pro tip:</strong> Run the Setup scanner the night before, then run the Live scanner the morning of your trading session.
        Stocks appearing in both are the ones where your pattern analysis aligns with real market momentum — the strongest signal.
      </div>

      {matches.length === 0 ? (
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-6 text-center">
          <div className="text-[#787B86] text-sm mb-1">No matches found</div>
          <p className="text-[#4a4e5a] text-xs">
            None of the {setupResult.candidates.length} flag setups are in the Live scanner&apos;s top movers.
            {sameDayAsSetup ? ' Try running the Live scan on the trading day after your Setup scan.' : ' This can happen on quiet days — try adjusting the Live scanner filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto border border-[#2a2e39] rounded-lg">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#1e222d] uppercase text-[10px] tracking-wide text-[#787B86]">
                  <th className="text-left px-3 py-2">Ticker</th>
                  <th className="text-right px-3 py-2">Price</th>
                  {/* Setup columns */}
                  <th className="text-right px-3 py-2 border-l border-[#2a2e39]">
                    <span className="text-brand-purple">Setup</span> Pole
                  </th>
                  <th className="text-right px-3 py-2">Flag</th>
                  <th className="text-right px-3 py-2">Score</th>
                  {/* Live columns */}
                  <th className="text-right px-3 py-2 border-l border-[#2a2e39]">
                    <span className="text-[#39FF14]">Live</span> Change%
                  </th>
                  <th className="text-right px-3 py-2">Gap%</th>
                  <th className="text-right px-3 py-2">RVOL</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {matches.map(({ setup: s, live: l }) => (
                  <tr key={s.ticker} className="border-t border-[#2a2e39] hover:bg-[#1e222d] transition-colors">
                    <td className="px-3 py-2">
                      <div className="font-bold text-white">{s.ticker}</div>
                      <div className="text-[10px] text-[#39FF14] font-semibold">● Pattern + Momentum</div>
                    </td>
                    <td className="px-3 py-2 text-right">${s.price.toFixed(2)}</td>

                    {/* Setup data */}
                    <td className="px-3 py-2 text-right text-green-400 border-l border-[#2a2e39]">+{s.poleGainPct.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right text-[#787B86]">{s.flagDays}d</td>
                    <td className="px-3 py-2 text-right font-bold text-white">{s.confidence.toFixed(0)}</td>

                    {/* Live data */}
                    <td className={`px-3 py-2 text-right font-semibold border-l border-[#2a2e39] ${l.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {l.changePct >= 0 ? '+' : ''}{l.changePct.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-2 text-right ${l.gapPct >= 5 ? 'text-green-400' : l.gapPct < 0 ? 'text-red-400' : 'text-[#787B86]'}`}>
                      {l.gapPct >= 0 ? '+' : ''}{l.gapPct.toFixed(1)}%
                    </td>
                    <td className={`px-3 py-2 text-right font-semibold ${l.todayRelVol >= 5 ? 'text-[#39FF14]' : 'text-yellow-400'}`}>
                      {l.todayRelVol.toFixed(1)}×
                    </td>

                    <td className="px-3 py-2">
                      <button
                        onClick={() => openStudy(s.ticker, liveDate)}
                        className="px-2 py-0.5 bg-[#39FF14]/10 hover:bg-[#39FF14]/20 text-[#39FF14] text-[10px] font-bold rounded transition-colors whitespace-nowrap border border-[#39FF14]/30"
                      >
                        Study →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 text-[10px] text-[#787B86]">
            Setup data from {setupDate} · Live momentum data from {liveDate} · Click Study to open the dual-pane chart in a new tab
          </div>
        </>
      )}
    </div>
  )
}
