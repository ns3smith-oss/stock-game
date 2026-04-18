'use client'

import type { PortfolioState } from '@/types'
import { STOCK_DEFINITIONS } from '@/lib/constants'
import { formatPrice } from '@/lib/stockSimulator'

interface PortfolioProps {
  portfolio: PortfolioState
  currentPrices: Record<string, number>
}

export function Portfolio({ portfolio, currentPrices }: PortfolioProps) {
  const marketValue = portfolio.holdings.reduce(
    (sum, h) => sum + h.sharesOwned * (currentPrices[h.ticker] ?? 0),
    0
  )
  const totalValue = portfolio.cashBalance + marketValue
  const startingValue = 1000
  const pnl = totalValue - startingValue
  const isProfit = pnl >= 0

  return (
    <div className="bg-white/10 rounded-2xl mx-4 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-gray-300 text-sm font-semibold">Your Portfolio</span>
        <div className={`text-sm font-black ${isProfit ? 'text-success' : 'text-danger'}`}>
          {isProfit ? '▲' : '▼'} ${Math.abs(pnl).toFixed(2)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-gray-400 text-xs mb-0.5">Cash</div>
          <div className="text-white font-bold text-lg">${formatPrice(portfolio.cashBalance)}</div>
        </div>
        <div>
          <div className="text-gray-400 text-xs mb-0.5">Total Value</div>
          <div className={`font-bold text-lg ${isProfit ? 'text-success' : 'text-danger'}`}>
            ${formatPrice(totalValue)}
          </div>
        </div>
      </div>

      {/* Holdings */}
      {portfolio.holdings.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-3 flex flex-col gap-2">
          {portfolio.holdings.map((h) => {
            const stock = STOCK_DEFINITIONS.find((s) => s.ticker === h.ticker)
            const currentPrice = currentPrices[h.ticker] ?? h.averageBuyPrice
            const holdingPnl = (currentPrice - h.averageBuyPrice) * h.sharesOwned
            const holdingUp = holdingPnl >= 0
            return (
              <div key={h.ticker} className="flex justify-between items-center">
                <span className="text-white text-sm font-semibold">
                  {stock?.emoji} {h.ticker} × {h.sharesOwned}
                </span>
                <span className={`text-sm font-bold ${holdingUp ? 'text-success' : 'text-danger'}`}>
                  {holdingUp ? '+' : '-'}${Math.abs(holdingPnl).toFixed(2)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
