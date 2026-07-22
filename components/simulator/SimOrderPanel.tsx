'use client'

import { useState } from 'react'

export interface Position {
  ticker: string
  shares: number
  avgEntry: number
  side: 'long' | 'short'
}

export interface Trade {
  id: string
  ticker: string
  side: 'long' | 'short'
  shares: number
  entry: number
  exit: number
  pnl: number
  time: number
}

interface Props {
  ticker: string
  currentPrice: number | null
  cashBalance: number
  position: Position | null
  onBuy: (shares: number, orderType: string, limitPrice?: number) => void
  onSell: (shares: number, orderType: string, limitPrice?: number) => void
}

const ORDER_TYPES = ['Market', 'Limit', 'Stop'] as const
type OrderType = (typeof ORDER_TYPES)[number]

export function SimOrderPanel({ ticker, currentPrice, cashBalance, position, onBuy, onSell }: Props) {
  const [orderType, setOrderType] = useState<OrderType>('Market')
  const [shares, setShares] = useState('100')
  const [limitPrice, setLimitPrice] = useState('')

  const sharesNum = parseInt(shares) || 0
  const limitNum = parseFloat(limitPrice) || 0
  const execPrice = orderType === 'Market' ? currentPrice : limitNum
  const cost = execPrice ? sharesNum * execPrice : 0

  const unrealizedPnL =
    position && currentPrice
      ? (currentPrice - position.avgEntry) *
        position.shares *
        (position.side === 'long' ? 1 : -1)
      : null

  return (
    <div className="flex flex-col gap-3 p-3 bg-brand-surface rounded-xl border border-white/10 h-full">
      <div className="text-white font-black text-sm">{ticker} — Order Entry</div>

      {/* Order type tabs */}
      <div className="flex gap-1">
        {ORDER_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`flex-1 py-1 text-xs font-bold rounded-lg transition-colors ${
              orderType === t ? 'bg-brand-purple text-white' : 'text-brand-muted hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Shares */}
      <div>
        <div className="text-brand-muted text-xs mb-1">Shares</div>
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          className="w-full bg-[#0D0D0D] border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-purple"
          min="1"
        />
        {/* Quick size buttons */}
        <div className="flex gap-1 mt-1">
          {[50, 100, 200, 500].map((n) => (
            <button
              key={n}
              onClick={() => setShares(String(n))}
              className="flex-1 text-[10px] text-brand-muted hover:text-white border border-white/10 rounded py-0.5 transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Limit/Stop price */}
      {orderType !== 'Market' && (
        <div>
          <div className="text-brand-muted text-xs mb-1">
            {orderType === 'Limit' ? 'Limit Price' : 'Stop Price'}
          </div>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            placeholder={currentPrice?.toFixed(2) ?? '0.00'}
            className="w-full bg-[#0D0D0D] border border-white/10 text-white text-sm px-3 py-1.5 rounded-lg focus:outline-none focus:border-brand-purple"
            step="0.01"
          />
        </div>
      )}

      {/* Cost preview */}
      {execPrice && sharesNum > 0 && (
        <div className="text-brand-muted text-xs">
          Cost: <span className="text-white">${cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}

      {/* Buy / Sell buttons */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onBuy(sharesNum, orderType, limitNum || undefined)}
          disabled={!currentPrice || sharesNum <= 0 || cost > cashBalance}
          className="flex-1 bg-brand-green text-black font-black py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          BUY
        </button>
        <button
          onClick={() => onSell(sharesNum, orderType, limitNum || undefined)}
          disabled={!currentPrice || sharesNum <= 0 || !position}
          className="flex-1 bg-brand-error text-white font-black py-2.5 rounded-xl text-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          SELL
        </button>
      </div>

      {/* Position info */}
      {position && (
        <div className="border-t border-white/10 pt-3 space-y-1.5">
          <div className="text-brand-muted text-xs font-bold uppercase tracking-wide">Open Position</div>
          <div className="flex justify-between text-xs">
            <span className="text-brand-muted">Shares</span>
            <span className="text-white font-bold">{position.shares}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-brand-muted">Avg Entry</span>
            <span className="text-white font-bold">${position.avgEntry.toFixed(2)}</span>
          </div>
          {currentPrice && (
            <div className="flex justify-between text-xs">
              <span className="text-brand-muted">Current</span>
              <span className="text-white font-bold">${currentPrice.toFixed(2)}</span>
            </div>
          )}
          {unrealizedPnL !== null && (
            <div className="flex justify-between text-xs">
              <span className="text-brand-muted">Unr. P&L</span>
              <span className={`font-black ${unrealizedPnL >= 0 ? 'text-brand-green' : 'text-brand-error'}`}>
                {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Cash */}
      <div className="flex justify-between text-xs border-t border-white/10 pt-2">
        <span className="text-brand-muted">Cash</span>
        <span className="text-white font-bold">
          ${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
