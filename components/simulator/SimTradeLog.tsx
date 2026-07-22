'use client'

import type { Trade } from './SimOrderPanel'

interface Props {
  trades: Trade[]
  totalPnL: number
}

export function SimTradeLog({ trades, totalPnL }: Props) {
  if (trades.length === 0) {
    return (
      <div className="p-3 bg-brand-surface rounded-xl border border-white/10">
        <div className="text-brand-muted text-xs font-bold uppercase tracking-wide mb-2">Trade Log</div>
        <div className="text-brand-muted text-xs text-center py-4">No trades yet</div>
      </div>
    )
  }

  return (
    <div className="p-3 bg-brand-surface rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <div className="text-brand-muted text-xs font-bold uppercase tracking-wide">Trade Log</div>
        <div className={`text-xs font-black ${totalPnL >= 0 ? 'text-brand-green' : 'text-brand-error'}`}>
          {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
        </div>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {[...trades].reverse().map((t) => (
          <div key={t.id} className="flex items-center justify-between text-xs py-1 border-b border-white/5">
            <div>
              <span className={`font-bold mr-1 ${t.side === 'long' ? 'text-brand-green' : 'text-brand-error'}`}>
                {t.side === 'long' ? 'L' : 'S'}
              </span>
              <span className="text-brand-muted">{t.shares}sh</span>
              <span className="text-white/50 mx-1">@</span>
              <span className="text-white">${t.entry.toFixed(2)}</span>
              <span className="text-white/30 mx-1">→</span>
              <span className="text-white">${t.exit.toFixed(2)}</span>
            </div>
            <span className={`font-black ${t.pnl >= 0 ? 'text-brand-green' : 'text-brand-error'}`}>
              {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
