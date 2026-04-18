'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { formatPrice } from '@/lib/stockSimulator'

interface TradePanelProps {
  ticker: string
  currentPrice: number
  cashBalance: number
  sharesOwned: number
  onBuy: (qty: number) => void
  onSell: (qty: number) => void
}

export function TradePanel({
  ticker,
  currentPrice,
  cashBalance,
  sharesOwned,
  onBuy,
  onSell,
}: TradePanelProps) {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState(1)

  const totalCost   = qty * currentPrice
  const canBuy      = totalCost <= cashBalance && qty > 0
  const canSell     = qty <= sharesOwned && qty > 0

  const maxBuyable  = Math.floor(cashBalance / currentPrice)
  const maxQty      = tab === 'buy' ? maxBuyable : sharesOwned

  const handleQtyChange = (delta: number) => {
    setQty((prev) => Math.max(1, Math.min(maxQty || 1, prev + delta)))
  }

  const handleAction = () => {
    if (tab === 'buy' && canBuy) {
      onBuy(qty)
      setQty(1)
    } else if (tab === 'sell' && canSell) {
      onSell(qty)
      setQty(1)
    }
  }

  return (
    <div className="mx-4 mt-2">
      {/* Buy / Sell tabs */}
      <div className="flex rounded-2xl overflow-hidden mb-4 bg-white/10">
        {(['buy', 'sell'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setQty(1) }}
            className={`flex-1 py-3 font-bold text-sm uppercase tracking-wide transition-colors ${
              tab === t
                ? t === 'buy' ? 'bg-success text-white' : 'bg-danger text-white'
                : 'text-gray-400'
            }`}
          >
            {t === 'buy' ? '💚 Buy' : '🔴 Sell'}
          </button>
        ))}
      </div>

      {/* Quantity stepper */}
      <div className="flex items-center justify-between mb-3 bg-white/10 rounded-2xl px-4 py-3">
        <button
          onClick={() => handleQtyChange(-1)}
          disabled={qty <= 1}
          className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl disabled:opacity-30 active:scale-90 transition-transform"
        >
          −
        </button>
        <div className="text-center">
          <div className="text-white text-2xl font-black">{qty}</div>
          <div className="text-gray-400 text-xs">shares</div>
        </div>
        <button
          onClick={() => handleQtyChange(1)}
          disabled={qty >= maxQty}
          className="w-10 h-10 rounded-full bg-white/20 text-white font-bold text-xl disabled:opacity-30 active:scale-90 transition-transform"
        >
          +
        </button>
      </div>

      {/* Cost preview */}
      <div className="text-center text-gray-300 text-sm mb-4">
        {tab === 'buy' ? (
          <>
            Cost: <span className="text-white font-bold">${formatPrice(totalCost)}</span>
            {' '}
            <span className="text-gray-500">
              (you have ${formatPrice(cashBalance)})
            </span>
          </>
        ) : (
          <>
            You own <span className="text-white font-bold">{sharesOwned}</span> shares
            {' '}· Proceeds: <span className="text-white font-bold">${formatPrice(totalCost)}</span>
          </>
        )}
      </div>

      {/* Action button */}
      <Button
        variant={tab === 'buy' ? 'success' : 'danger'}
        size="lg"
        disabled={tab === 'buy' ? !canBuy : !canSell}
        onClick={handleAction}
      >
        {tab === 'buy'
          ? canBuy
            ? `Buy ${qty} share${qty > 1 ? 's' : ''} of ${ticker}`
            : 'Not enough cash'
          : canSell
            ? `Sell ${qty} share${qty > 1 ? 's' : ''} of ${ticker}`
            : 'Not enough shares'}
      </Button>
    </div>
  )
}
