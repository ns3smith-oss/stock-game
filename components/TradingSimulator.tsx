'use client'

import { useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { useStockTicker } from '@/hooks/useStockTicker'
import { STOCK_DEFINITIONS } from '@/lib/constants'
import { getHolding } from '@/lib/gameState'
import { StockChart } from './StockChart'
import { Portfolio } from './Portfolio'
import { TradePanel } from './TradePanel'
import { XPPopup } from './XPPopup'

export function TradingSimulator() {
  const { state, addXP, executeTrade } = useGameState()
  const [selectedTicker, setSelectedTicker] = useState(STOCK_DEFINITIONS[0].ticker)
  const [showXP, setShowXP] = useState<number | null>(null)

  const { prices, currentPrice, priceChange, priceChangePercent } =
    useStockTicker(selectedTicker)

  const selectedStock = STOCK_DEFINITIONS.find((s) => s.ticker === selectedTicker)!
  const holding = getHolding(state, selectedTicker)

  const currentPrices: Record<string, number> = {}
  STOCK_DEFINITIONS.forEach((s) => {
    // For non-selected stocks, use their last known price from holdings or base
    currentPrices[s.ticker] =
      s.ticker === selectedTicker
        ? currentPrice
        : s.basePrice
  })

  const handleBuy = (qty: number) => {
    executeTrade(selectedTicker, 'buy', qty, currentPrice)
    const xp = state.portfolioState.hasCompletedFirstTrade ? 5 : 10
    addXP(xp)
    setShowXP(xp)
  }

  const handleSell = (qty: number) => {
    executeTrade(selectedTicker, 'sell', qty, currentPrice)
    addXP(5)
    setShowXP(5)
  }

  return (
    <div className="w-full">
      {/* Stock selector tabs */}
      <div className="flex gap-2 px-4 mb-2">
        {STOCK_DEFINITIONS.map((s) => (
          <button
            key={s.ticker}
            onClick={() => setSelectedTicker(s.ticker)}
            className={`flex-1 py-2 rounded-2xl text-sm font-bold transition-colors ${
              selectedTicker === s.ticker
                ? 'bg-white/20 text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {s.emoji} {s.ticker}
          </button>
        ))}
      </div>

      {/* Chart */}
      <StockChart
        prices={prices}
        ticker={selectedStock.ticker}
        name={selectedStock.name}
        emoji={selectedStock.emoji}
        currentPrice={currentPrice}
        priceChange={priceChange}
        priceChangePercent={priceChangePercent}
      />

      {/* Portfolio */}
      <Portfolio
        portfolio={state.portfolioState}
        currentPrices={currentPrices}
      />

      {/* Trade panel */}
      <div className="mt-3">
        <TradePanel
          ticker={selectedTicker}
          currentPrice={currentPrice}
          cashBalance={state.portfolioState.cashBalance}
          sharesOwned={holding?.sharesOwned ?? 0}
          onBuy={handleBuy}
          onSell={handleSell}
        />
      </div>

      {/* XP popup on trade */}
      {showXP !== null && (
        <XPPopup amount={showXP} onComplete={() => setShowXP(null)} />
      )}
    </div>
  )
}
