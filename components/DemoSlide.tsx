'use client'

import { useState } from 'react'
import { haptics } from '@/lib/haptics'

// ─── Place an Order ───────────────────────────────────────────────
function PlaceOrderDemo() {
  const PRICE_PER_SHARE = 100
  const TOTAL_SHARES = 100
  const TARGET = 5

  const [qty, setQty] = useState('')
  const [stage, setStage] = useState<'order' | 'review' | 'confirmed'>('order')

  const parsed = parseInt(qty, 10)
  const validQty = !isNaN(parsed) && parsed > 0 && parsed <= TOTAL_SHARES
  const total = validQty ? parsed * PRICE_PER_SHARE : 0
  const ownershipNum = validQty ? (parsed / TOTAL_SHARES) * 100 : 0
  const ownership = Number.isInteger(ownershipNum) ? ownershipNum.toString() : ownershipNum.toFixed(1)
  const isTarget = parsed === TARGET

  function handleReview() {
    if (!validQty) return
    haptics.tap()
    setStage('review')
  }

  function handleConfirm() {
    haptics.correct()
    setStage('confirmed')
  }

  function handleReset() {
    haptics.tap()
    setQty('')
    setStage('order')
  }

  if (stage === 'confirmed') {
    return (
      <div className="flex flex-col items-center gap-4 animate-slideUp">
        <div className="text-6xl animate-bounce">🎉</div>
        <div className="w-full bg-brand-green/20 border-2 border-brand-green rounded-3xl p-5">
          <p className="text-brand-green font-black text-2xl text-center">Order Filled!</p>
          <p className="text-brand-white font-bold text-base text-center mt-1">{parsed} shares of PIZZA</p>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Shares purchased</span>
            <span className="text-brand-white font-bold">{parsed}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-brand-muted">Total shares in company</span>
            <span className="text-brand-white font-bold">{TOTAL_SHARES}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-brand-muted">Price per share</span>
            <span className="text-brand-white font-bold">${PRICE_PER_SHARE}.00</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-brand-muted">Total paid</span>
            <span className="text-brand-white font-bold">${total.toLocaleString()}</span>
          </div>
          <div className="h-px bg-white/10 my-3" />
          <div className="flex justify-between items-center">
            <div>
              <p className="text-brand-muted text-xs">Your ownership</p>
              <p className="text-brand-muted text-xs mt-0.5">{parsed} ÷ {TOTAL_SHARES} shares</p>
            </div>
            <span className="text-brand-green font-black text-3xl">{ownership}%</span>
          </div>
        </div>
        {isTarget && (
          <div className="bg-brand-purple/20 border border-brand-purple rounded-2xl px-4 py-3 text-center animate-slideUp">
            <p className="text-brand-purple font-bold text-sm">
              5 shares out of 100 = 5%. That's exactly the math the next question will test you on. 🍕
            </p>
          </div>
        )}
        <button onClick={handleReset} className="text-brand-muted text-xs underline">Try a different amount</button>
      </div>
    )
  }

  if (stage === 'review') {
    return (
      <div className="flex flex-col gap-4 animate-slideUp">
        <div className="bg-brand-surface border border-white/15 rounded-3xl overflow-hidden">
          <div className="bg-white/5 px-5 py-3 border-b border-white/10">
            <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide">Order Review</p>
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            <div className="flex justify-between">
              <span className="text-brand-muted text-sm">Stock</span>
              <div className="text-right">
                <p className="text-brand-white font-bold text-sm">Pizza Shop Inc.</p>
                <p className="text-brand-muted text-xs">PIZZA</p>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted text-sm">Order type</span>
              <span className="text-brand-white font-bold text-sm">Market Order</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted text-sm">Shares buying</span>
              <span className="text-brand-white font-bold text-sm">{parsed} of {TOTAL_SHARES}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted text-sm">Est. price/share</span>
              <span className="text-brand-white font-bold text-sm">${PRICE_PER_SHARE}.00</span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between">
              <span className="text-brand-white font-bold text-sm">Est. total</span>
              <span className="text-brand-green font-black text-base">${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-brand-muted text-sm">Ownership ({parsed} ÷ {TOTAL_SHARES})</span>
              <span className="text-brand-green font-black text-xl">{ownership}%</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full bg-brand-green text-brand-black font-black text-lg py-4 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform"
        >
          Confirm Order →
        </button>
        <button onClick={() => setStage('order')} className="text-brand-muted text-sm text-center">
          ← Edit order
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Context callout */}
      <div className="bg-brand-purple/20 border border-brand-purple/50 rounded-2xl px-4 py-3">
        <p className="text-brand-white text-sm font-semibold text-center">
          🍕 Pizza Shop Inc. has <span className="text-brand-purple font-black">100 total shares</span>. Buy 5 shares to see what you own.
        </p>
      </div>

      {/* Stock header */}
      <div className="bg-brand-surface border border-white/15 rounded-3xl overflow-hidden">
        <div className="bg-white/5 px-5 py-3 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-brand-white font-black text-base">Pizza Shop Inc.</p>
            <p className="text-brand-muted text-xs">PIZZA · NYSE · 100 shares total</p>
          </div>
          <div className="text-right">
            <p className="text-brand-white font-black text-xl">${PRICE_PER_SHARE}.00</p>
            <p className="text-brand-green text-xs font-semibold">+2.4% today</p>
          </div>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* Order type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide">Order Type</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-brand-purple/20 border border-brand-purple rounded-xl px-4 py-2.5 text-center">
                <p className="text-brand-purple font-bold text-sm">Market Order</p>
              </div>
              <div className="flex-1 bg-brand-surface border border-white/10 rounded-xl px-4 py-2.5 text-center opacity-40">
                <p className="text-brand-muted font-bold text-sm">Limit Order</p>
              </div>
            </div>
          </div>

          {/* Shares input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-brand-muted text-xs font-semibold uppercase tracking-wide">
                Number of Shares
              </label>
              <span className="text-brand-muted text-xs">100 available</span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="Enter 5"
                className={`w-full bg-brand-black border-2 rounded-2xl px-5 py-4 text-brand-white text-lg font-black placeholder:text-brand-muted/50 focus:outline-none transition-colors ${
                  isTarget ? 'border-brand-green' : validQty ? 'border-brand-purple' : 'border-white/15 focus:border-brand-purple'
                }`}
              />
              {isTarget && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-green text-sm font-black">✓</span>
              )}
            </div>
            {qty !== '' && !validQty && (
              <p className="text-brand-error text-xs pl-1">Enter a number between 1 and {TOTAL_SHARES}</p>
            )}
          </div>

          {/* Ownership math — shown live */}
          {validQty && (
            <div className="bg-white/5 rounded-2xl px-4 py-3 flex flex-col gap-2 animate-slideUp">
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">Est. cost</span>
                <span className="text-brand-white font-bold">${total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-brand-muted">Ownership math</span>
                <span className="text-brand-white font-bold">{parsed} ÷ {TOTAL_SHARES} shares</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex justify-between items-center">
                <span className="text-brand-muted text-sm">You would own</span>
                <span className={`font-black text-2xl ${isTarget ? 'text-brand-green' : 'text-brand-white'}`}>
                  {ownership}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleReview}
        disabled={!validQty}
        className={`w-full font-black text-lg py-4 rounded-2xl transition-all active:scale-95 ${
          validQty
            ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/30'
            : 'bg-brand-surface text-brand-muted border border-white/10 opacity-50'
        }`}
      >
        Review Order →
      </button>
    </div>
  )
}

// ─── Supply & Demand ──────────────────────────────────────────────
function SupplyDemandDemo() {
  const [buyers, setBuyers] = useState(3)
  const [sellers, setSellers] = useState(3)

  const diff = buyers - sellers
  const up = diff > 0
  const down = diff < 0
  const flat = diff === 0

  function addBuyer() { haptics.tap(); setBuyers(b => Math.min(b + 1, 8)) }
  function addSeller() { haptics.tap(); setSellers(s => Math.min(s + 1, 8)) }
  function reset() { haptics.tap(); setBuyers(3); setSellers(3) }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        {/* Buyers column */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-1 w-full">
            {Array.from({ length: buyers }).map((_, i) => (
              <div key={i} className="w-full h-7 bg-brand-green/30 border border-brand-green rounded-lg flex items-center justify-center text-xs text-brand-green font-semibold animate-slideUp">
                🙋 Buyer
              </div>
            ))}
          </div>
          <button
            onClick={addBuyer}
            className="w-full bg-brand-green/20 border border-brand-green text-brand-green font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-all"
          >
            + Add Buyer
          </button>
        </div>

        {/* Center arrow */}
        <div className="flex flex-col items-center justify-center gap-2 px-1">
          <div className={`text-3xl font-black transition-all duration-300 ${up ? 'text-brand-green' : down ? 'text-brand-error' : 'text-brand-muted'}`}>
            {up ? '↑' : down ? '↓' : '→'}
          </div>
          <div className={`text-xs font-bold text-center transition-all duration-300 ${up ? 'text-brand-green' : down ? 'text-brand-error' : 'text-brand-muted'}`}>
            {up ? 'Price UP' : down ? 'Price DOWN' : 'Price flat'}
          </div>
          <button onClick={reset} className="text-brand-muted text-xs underline mt-2">reset</button>
        </div>

        {/* Sellers column */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-1 w-full">
            {Array.from({ length: sellers }).map((_, i) => (
              <div key={i} className="w-full h-7 bg-brand-error/20 border border-brand-error rounded-lg flex items-center justify-center text-xs text-brand-error font-semibold animate-slideUp">
                📤 Seller
              </div>
            ))}
          </div>
          <button
            onClick={addSeller}
            className="w-full bg-brand-error/20 border border-brand-error text-brand-error font-bold text-sm py-2.5 rounded-xl active:scale-95 transition-all"
          >
            + Add Seller
          </button>
        </div>
      </div>

      {!flat && (
        <div className={`rounded-2xl border px-4 py-3 text-center animate-slideUp ${up ? 'bg-brand-green/20 border-brand-green' : 'bg-brand-error/20 border-brand-error'}`}>
          <p className={`font-black text-base ${up ? 'text-brand-green' : 'text-brand-error'}`}>
            {up ? `${buyers - sellers} more buyer${buyers - sellers > 1 ? 's' : ''} than sellers → price rises` : `${sellers - buyers} more seller${sellers - buyers > 1 ? 's' : ''} than buyers → price falls`}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Savings vs Investing ─────────────────────────────────────────
function SavingsVsInvestingDemo() {
  const [years, setYears] = useState(5)
  const INITIAL = 1000

  const savings = Math.round(INITIAL * Math.pow(1.01, years))
  const investing = Math.round(INITIAL * Math.pow(1.10, years))
  const maxVal = Math.round(INITIAL * Math.pow(1.10, 30))

  const savingsPct = Math.max(3, (savings / maxVal) * 100)
  const investingPct = Math.max(3, (investing / maxVal) * 100)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-brand-muted text-xs w-14 text-right">Yr {years}</span>
        <input
          type="range" min={1} max={30} value={years}
          onChange={e => setYears(Number(e.target.value))}
          className="flex-1 accent-[#8B00FF] cursor-pointer"
        />
        <span className="text-brand-muted text-xs w-14">Yr 30</span>
      </div>

      <div className="flex gap-4 items-end" style={{ height: 160 }}>
        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <p className="text-brand-muted font-black text-sm">${savings.toLocaleString()}</p>
          <div
            className="w-full rounded-t-2xl transition-all duration-500 bg-brand-muted/50"
            style={{ height: `${savingsPct}%` }}
          />
          <p className="text-brand-muted text-xs font-semibold text-center">Savings<br/>1%/yr</p>
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
          <p className="text-brand-green font-black text-sm">${investing.toLocaleString()}</p>
          <div
            className="w-full rounded-t-2xl transition-all duration-500 bg-brand-green"
            style={{ height: `${investingPct}%` }}
          />
          <p className="text-brand-green text-xs font-semibold text-center">Investing<br/>10%/yr</p>
        </div>
      </div>

      {years >= 15 && (
        <div className="bg-brand-green/20 border border-brand-green rounded-2xl px-4 py-3 text-center animate-slideUp">
          <p className="text-brand-green font-bold text-sm">
            Investing earned <span className="font-black">{Math.round(investing / savings)}×</span> more than saving!
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 52-Week Price Range ──────────────────────────────────────────
function PriceRangeDemo() {
  const low = 142
  const high = 198
  const [idx, setIdx] = useState(0)

  const SCENARIOS = [
    { price: 148, label: 'Near 52-week low', note: 'Potential buying opportunity — stock is near its cheapest point of the year', color: 'text-brand-green', dot: 'bg-brand-green' },
    { price: 172, label: 'Mid-range', note: 'Neutral — not especially cheap or expensive relative to the past year', color: 'text-yellow-400', dot: 'bg-yellow-400' },
    { price: 195, label: 'Near 52-week high', note: 'Stock has been on a strong run — you may be buying near the top', color: 'text-brand-error', dot: 'bg-brand-error' },
  ]

  const s = SCENARIOS[idx]
  const pct = ((s.price - low) / (high - low)) * 100

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-brand-green">52W Low: ${low}</span>
          <span className="text-brand-error">52W High: ${high}</span>
        </div>

        <div className="relative h-8">
          <div className="absolute inset-y-2 inset-x-0 rounded-full overflow-hidden bg-gradient-to-r from-brand-green/40 via-yellow-500/20 to-brand-error/40 border border-white/10" />
          <div
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-white shadow-lg transition-all duration-500 ${s.dot}`}
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="text-center">
          <p className={`font-black text-3xl ${s.color}`}>${s.price}</p>
          <p className="text-brand-white font-bold text-sm mt-1">{s.label}</p>
          <p className="text-brand-muted text-xs mt-1 leading-relaxed">{s.note}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {SCENARIOS.map((sc, i) => (
          <button
            key={i}
            onClick={() => { haptics.tap(); setIdx(i) }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              idx === i ? 'bg-brand-purple text-brand-white' : 'bg-brand-surface border border-white/10 text-brand-muted'
            }`}
          >
            {i === 0 ? '📉 Low' : i === 1 ? '➡️ Mid' : '📈 High'}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Bull / Bear Chart ────────────────────────────────────────────
function BullBearDemo() {
  const [phase, setPhase] = useState<'bull' | 'correction' | 'bear' | 'recovery'>('bull')

  const PHASES = {
    bull: {
      label: '🐂 Bull Market', color: 'text-brand-green', bg: 'bg-brand-green/20 border-brand-green',
      desc: 'Market up 20%+. Economy strong, sentiment high. Most stocks are rising.',
      pts: [20, 28, 35, 42, 52, 61, 68, 76, 84, 93],
    },
    correction: {
      label: '⚠️ Correction', color: 'text-yellow-400', bg: 'bg-yellow-500/20 border-yellow-500',
      desc: 'Market dips 10–20%. Normal and temporary — recovers within months most of the time.',
      pts: [93, 87, 80, 75, 70, 72, 76, 80, 85, 90],
    },
    bear: {
      label: '🐻 Bear Market', color: 'text-brand-error', bg: 'bg-brand-error/20 border-brand-error',
      desc: 'Market down 20%+. Painful — but every bear market in history has been followed by a recovery.',
      pts: [90, 82, 72, 63, 54, 47, 42, 38, 35, 30],
    },
    recovery: {
      label: '🌅 Recovery', color: 'text-brand-purple', bg: 'bg-brand-purple/20 border-brand-purple',
      desc: 'The market climbs back. Investors who held — or bought at the bottom — are rewarded.',
      pts: [30, 38, 47, 57, 66, 74, 81, 89, 95, 100],
    },
  }

  const cur = PHASES[phase]
  const W = 260; const H = 80
  const pathD = cur.pts.map((y, i) => {
    const x = (i / (cur.pts.length - 1)) * W
    const py = H - (y / 100) * H
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${py.toFixed(1)}`
  }).join(' ')

  const strokeColor = phase === 'bull' ? '#39FF14' : phase === 'correction' ? '#EAB308' : phase === 'bear' ? '#FF6B6B' : '#8B00FF'

  return (
    <div className="flex flex-col gap-4">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="rounded-2xl bg-brand-surface border border-white/10" style={{ height: 90 }}>
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <div className={`rounded-2xl border px-4 py-3 text-center ${cur.bg}`}>
        <p className={`font-black text-base ${cur.color}`}>{cur.label}</p>
        <p className="text-brand-muted text-xs mt-1 leading-relaxed">{cur.desc}</p>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(['bull', 'correction', 'bear', 'recovery'] as const).map((p) => (
          <button
            key={p}
            onClick={() => { haptics.tap(); setPhase(p) }}
            className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all active:scale-95 ${
              phase === p ? 'bg-brand-purple text-brand-white' : 'bg-brand-surface border border-white/10 text-brand-muted'
            }`}
          >
            {p === 'correction' ? 'Dip' : p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Dollar-Cost Averaging ────────────────────────────────────────
function DCADemo() {
  const INVEST = 50
  const WEEKS = [
    { week: 1, price: 50 },
    { week: 2, price: 38 },
    { week: 3, price: 62 },
    { week: 4, price: 44 },
    { week: 5, price: 55 },
  ]
  const [revealed, setRevealed] = useState(0)

  const purchases = WEEKS.slice(0, revealed)
  const totalShares = purchases.reduce((a, w) => a + INVEST / w.price, 0)
  const avgCost = revealed > 0 ? (revealed * INVEST) / totalShares : 0
  const maxPrice = Math.max(...WEEKS.map(w => w.price))

  function buyNext() {
    if (revealed < WEEKS.length) { haptics.tap(); setRevealed(r => r + 1) }
  }
  function reset() { haptics.tap(); setRevealed(0) }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-brand-muted text-xs text-center">You invest $50 every week — tap to buy each week</p>

      <div className="flex items-end gap-2" style={{ height: 120 }}>
        {WEEKS.map((w, i) => {
          const done = i < revealed
          const active = i === revealed
          const barH = (w.price / maxPrice) * 90
          return (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <p className={`text-xs font-bold ${done ? 'text-brand-green' : active ? 'text-brand-white' : 'text-brand-muted'}`}>
                ${w.price}
              </p>
              <div
                className={`w-full rounded-t-xl transition-all duration-300 ${
                  done ? 'bg-brand-green' : active ? 'bg-brand-purple opacity-70' : 'bg-brand-surface border border-white/10'
                }`}
                style={{ height: barH }}
              />
              <p className="text-brand-muted text-xs">Wk {w.week}</p>
            </div>
          )
        })}
      </div>

      {revealed > 0 && (
        <div className="bg-brand-surface border border-white/10 rounded-2xl px-4 py-3 flex flex-col gap-1 animate-slideUp">
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Total invested</span>
            <span className="text-brand-white font-bold">${revealed * INVEST}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Shares owned</span>
            <span className="text-brand-white font-bold">{totalShares.toFixed(3)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-brand-muted">Avg cost/share</span>
            <span className="text-brand-green font-bold">${avgCost.toFixed(2)}</span>
          </div>
        </div>
      )}

      {revealed === 5 && (
        <div className="bg-brand-green/20 border border-brand-green rounded-2xl px-4 py-3 text-center animate-slideUp">
          <p className="text-brand-green font-bold text-sm">
            Your avg cost is ${avgCost.toFixed(2)} — lower than {WEEKS.filter(w => w.price > avgCost).length} of the 5 weeks!
          </p>
        </div>
      )}

      <div className="flex gap-2">
        {revealed < WEEKS.length ? (
          <button onClick={buyNext} className="flex-1 bg-brand-green text-brand-black font-black py-3 rounded-2xl active:scale-95 transition-all text-sm">
            Invest $50 — Week {revealed + 1} →
          </button>
        ) : (
          <button onClick={reset} className="flex-1 bg-brand-surface border border-white/10 text-brand-muted font-bold py-3 rounded-2xl active:scale-95 text-sm">
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Candlestick Anatomy ──────────────────────────────────────────
function CandlestickAnatomyDemo() {
  const [active, setActive] = useState<string | null>(null)

  // Candle geometry
  const CX  = 108  // wick center x
  const BL  = 80   // body left
  const BR  = 136  // body right
  const WT  = 22   // wick top (high)
  const CT  = 72   // close  (body top  — green candle closes higher)
  const OP  = 208  // open   (body bottom)
  const WB  = 265  // wick bottom (low)
  const LX  = 168  // right-side label text x-start

  const PARTS = [
    {
      id: 'high',
      label: 'HIGH',
      y: WT,
      tipX: CX,   // arrowhead lands on the wick center
      desc: 'The highest price reached during the period — the very tip of the upper wick.',
    },
    {
      id: 'close',
      label: 'CLOSE',
      y: CT,
      tipX: BR,   // arrowhead lands on body right edge
      desc: 'Where the price ended. On a green candle, Close is at the TOP of the body because the price finished higher than it started.',
    },
    {
      id: 'open',
      label: 'OPEN',
      y: OP,
      tipX: BR,
      desc: 'Where the price started. On a green candle, Open is at the BOTTOM of the body because the price went up from here.',
    },
    {
      id: 'low',
      label: 'LOW',
      y: WB,
      tipX: CX,
      desc: 'The lowest price reached during the period — the very bottom of the lower wick.',
    },
  ]

  function toggle(id: string) {
    haptics.tap()
    setActive(prev => prev === id ? null : id)
  }

  const isAny = active !== null

  function alphaFor(part: 'wick-up' | 'body' | 'wick-dn') {
    if (!isAny) return 1
    if (part === 'wick-up' && active === 'high') return 1
    if (part === 'wick-dn' && active === 'low') return 1
    if (part === 'body' && (active === 'close' || active === 'open')) return 1
    return 0.1
  }

  const activePart = PARTS.find(p => p.id === active)

  return (
    <div className="flex flex-col gap-4">
      <svg viewBox="0 0 290 285" style={{ width: '100%', maxHeight: 255 }}>

        {/* ── Candle ── */}

        {/* Upper wick */}
        <line x1={CX} y1={WT} x2={CX} y2={CT}
          stroke="#39FF14" strokeWidth="3" strokeLinecap="round"
          opacity={alphaFor('wick-up')} />

        {/* Body */}
        <rect x={BL} y={CT} width={BR - BL} height={OP - CT}
          fill={`rgba(57,255,20,${alphaFor('body') * 0.2})`}
          stroke={`rgba(57,255,20,${alphaFor('body')})`}
          strokeWidth="2.5" rx="4" />

        {/* Lower wick */}
        <line x1={CX} y1={OP} x2={CX} y2={WB}
          stroke="#39FF14" strokeWidth="3" strokeLinecap="round"
          opacity={alphaFor('wick-dn')} />

        {/* ── Left-side structural labels (static) ── */}

        {/* "Wick" — points to upper wick midpoint */}
        <text x={BL - 8} y={(WT + CT) / 2 + 4}
          textAnchor="end" fill="#505050" fontSize="11"
          fontFamily="system-ui,-apple-system,sans-serif">Wick</text>
        <line x1={BL - 6} y1={(WT + CT) / 2}
              x2={CX - 2} y2={(WT + CT) / 2}
          stroke="#383838" strokeWidth="1" strokeDasharray="3,2" />

        {/* "Body" — points to body left edge midpoint */}
        <text x={BL - 8} y={(CT + OP) / 2 + 4}
          textAnchor="end" fill="#505050" fontSize="11"
          fontFamily="system-ui,-apple-system,sans-serif">Body</text>
        <line x1={BL - 6} y1={(CT + OP) / 2}
              x2={BL} y2={(CT + OP) / 2}
          stroke="#383838" strokeWidth="1" strokeDasharray="3,2" />

        {/* ── Right-side interactive labels ── */}
        {PARTS.map(part => {
          const on = active === part.id
          const dimmed = isAny && !on
          const arrowColor = on ? '#8B00FF' : dimmed ? '#252525' : '#4A4A4A'
          const lineColor  = on ? '#8B00FF' : dimmed ? '#1E1E1E' : '#404040'
          const textColor  = on ? '#FFFFFF' : dimmed ? '#252525' : '#A0A0A0'
          const lineFromX  = part.tipX + 11  // start leader line just after arrow base

          return (
            <g key={part.id} onClick={() => toggle(part.id)} style={{ cursor: 'pointer' }}>

              {/* Highlight dot when active */}
              {on && <circle cx={part.tipX} cy={part.y} r="5" fill="#8B00FF" />}

              {/* Left-pointing arrowhead: tip at (tipX, y), wings spread right */}
              <polygon
                points={`${part.tipX},${part.y} ${part.tipX + 11},${part.y - 5} ${part.tipX + 11},${part.y + 5}`}
                fill={arrowColor} />

              {/* Leader line */}
              <line
                x1={lineFromX} y1={part.y}
                x2={LX - 6}    y2={part.y}
                stroke={lineColor} strokeWidth="1.2"
                strokeDasharray={on ? '' : '5,3'} />

              {/* Active pill background */}
              {on && <rect x={LX - 3} y={part.y - 13} width={80} height={26}
                rx="7" fill="#8B00FF" opacity={0.2} />}

              {/* Label text */}
              <text x={LX} y={part.y + 5}
                fill={textColor}
                fontSize={on ? 13 : 12}
                fontWeight={on ? '800' : '500'}
                fontFamily="system-ui,-apple-system,sans-serif">
                {part.label}
              </text>

              {/* Invisible tap target */}
              <rect x={LX - 3} y={part.y - 14} width={115} height={28} fill="transparent" />
            </g>
          )
        })}

        {/* Hint text */}
        {!isAny && (
          <text x={190} y={279} textAnchor="middle" fill="#404040" fontSize="11"
            fontFamily="system-ui,-apple-system,sans-serif">
            Tap a label to learn more
          </text>
        )}
      </svg>

      {/* Description panel */}
      {activePart ? (
        <div className="bg-brand-purple/20 border border-brand-purple/50 rounded-2xl px-4 py-3 animate-slideUp">
          <p className="text-brand-purple font-black text-xs uppercase tracking-widest mb-1">{activePart.label}</p>
          <p className="text-brand-white text-sm leading-relaxed">{activePart.desc}</p>
        </div>
      ) : (
        <p className="text-brand-muted text-xs text-center">
          This is a <span className="text-brand-green font-bold">green candle</span> — price went up during this period
        </p>
      )}
    </div>
  )
}

// ─── Position Sizing Calculator ──────────────────────────────────
const ACCOUNT_PRESETS = [500, 1000, 2000, 5000, 10000]

function PositionSizingDemo() {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState(2000)
  const [stockPrice, setStockPrice] = useState('50')
  const [stopLoss, setStopLoss] = useState('48')

  const stock = parseFloat(stockPrice)
  const stop  = parseFloat(stopLoss)

  const maxRisk      = account * 0.01
  const riskPerShare = (!isNaN(stock) && !isNaN(stop)) ? stock - stop : 0
  const validStop    = !isNaN(stock) && !isNaN(stop) && stop > 0 && stop < stock
  const shares       = validStop && riskPerShare > 0 ? Math.floor(maxRisk / riskPerShare) : 0
  const totalCost    = shares * stock
  const actualLoss   = shares * riskPerShare

  function goNext() { haptics.tap(); setStep(s => s + 1) }
  function goBack() { haptics.tap(); setStep(s => s - 1) }
  function reset()  { haptics.tap(); setStep(1); setAccount(2000); setStockPrice('50'); setStopLoss('48') }

  return (
    <div className="flex flex-col gap-4">

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map(n => (
          <div key={n} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${
              step === n ? 'bg-brand-purple text-brand-white' :
              step > n   ? 'bg-brand-green text-brand-black' :
                           'bg-brand-surface border border-white/15 text-brand-muted'
            }`}>
              {step > n ? '✓' : n}
            </div>
            {n < 3 && <div className={`flex-1 h-0.5 rounded-full transition-all ${step > n ? 'bg-brand-green' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      {/* ── Step 1: Set your limit ── */}
      {step === 1 && (
        <div className="flex flex-col gap-4 animate-slideIn">
          <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl px-4 py-3">
            <p className="text-brand-purple font-black text-xs uppercase tracking-widest mb-1">Step 1 of 3</p>
            <p className="text-brand-white font-bold text-sm">Set your loss limit</p>
            <p className="text-brand-muted text-xs mt-1 leading-relaxed">
              Before you buy anything, decide the most you're willing to lose on this one trade. The 1% rule makes this automatic — it's always 1% of your account.
            </p>
          </div>

          <div>
            <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-2">My account size is</p>
            <div className="flex gap-1.5">
              {ACCOUNT_PRESETS.map(amt => (
                <button
                  key={amt}
                  onClick={() => { haptics.tap(); setAccount(amt) }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                    account === amt
                      ? 'bg-brand-purple text-brand-white'
                      : 'bg-brand-surface border border-white/10 text-brand-muted'
                  }`}
                >
                  {amt >= 1000 ? `$${amt / 1000}K` : `$${amt}`}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-brand-surface border border-white/10 rounded-2xl px-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-brand-muted text-xs">1% of ${account.toLocaleString()}</p>
                <p className="text-brand-white text-sm mt-0.5">This is the <span className="text-brand-purple font-bold">maximum I can lose</span> on one trade</p>
              </div>
              <span className="text-brand-purple font-black text-3xl">${maxRisk.toFixed(0)}</span>
            </div>
          </div>

          <button
            onClick={goNext}
            className="w-full bg-brand-purple text-brand-white font-black py-4 rounded-2xl active:scale-95 transition-all"
          >
            That's my limit →
          </button>
        </div>
      )}

      {/* ── Step 2: Find your exit ── */}
      {step === 2 && (
        <div className="flex flex-col gap-4 animate-slideIn">
          <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl px-4 py-3">
            <p className="text-brand-purple font-black text-xs uppercase tracking-widest mb-1">Step 2 of 3</p>
            <p className="text-brand-white font-bold text-sm">Pick your "I was wrong" price</p>
            <p className="text-brand-muted text-xs mt-1 leading-relaxed">
              Before you buy, decide the price where you'd sell if the trade goes against you. This is your stop loss — the point where you say "my reason for buying this is gone."
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-1.5">I'm buying at</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted font-bold">$</span>
                <input
                  type="number" inputMode="decimal"
                  value={stockPrice}
                  onChange={e => setStockPrice(e.target.value)}
                  className="w-full bg-brand-black border-2 border-white/15 focus:border-brand-purple rounded-xl pl-7 pr-3 py-3 text-brand-white font-bold text-base focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide mb-1.5">I'll exit if it hits</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted font-bold">$</span>
                <input
                  type="number" inputMode="decimal"
                  value={stopLoss}
                  onChange={e => setStopLoss(e.target.value)}
                  className={`w-full bg-brand-black border-2 rounded-xl pl-7 pr-3 py-3 text-brand-white font-bold text-base focus:outline-none transition-colors ${
                    stopLoss !== '' && !validStop ? 'border-brand-error' : 'border-white/15 focus:border-brand-purple'
                  }`}
                />
              </div>
              {stopLoss !== '' && stock > 0 && stop >= stock && (
                <p className="text-brand-error text-xs mt-1">Must be below buy price</p>
              )}
            </div>
          </div>

          {validStop && (
            <div className="bg-brand-surface border border-white/10 rounded-2xl px-4 py-3 animate-slideUp">
              <p className="text-brand-muted text-xs mb-2">If this trade goes wrong and hits your exit:</p>
              <div className="flex justify-between items-center">
                <span className="text-brand-white text-sm">${stock.toFixed(2)} − ${stop.toFixed(2)} per share</span>
                <span className="text-brand-error font-black text-xl">−${riskPerShare.toFixed(2)}<span className="text-sm font-semibold"> / share</span></span>
              </div>
              <p className="text-brand-muted text-xs mt-2">
                Every share you own will cost you <span className="text-brand-white font-bold">${riskPerShare.toFixed(2)}</span> if you're wrong. That's what the next step uses.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={goBack} className="px-5 py-4 rounded-2xl border border-white/10 text-brand-muted font-bold active:scale-95 transition-all">←</button>
            <button
              onClick={goNext}
              disabled={!validStop}
              className={`flex-1 font-black py-4 rounded-2xl active:scale-95 transition-all ${validStop ? 'bg-brand-purple text-brand-white' : 'bg-brand-surface text-brand-muted border border-white/10 opacity-50'}`}
            >
              That's my exit →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: The math gives you the answer ── */}
      {step === 3 && (
        <div className="flex flex-col gap-4 animate-slideIn">
          <div className="bg-brand-purple/10 border border-brand-purple/30 rounded-2xl px-4 py-3">
            <p className="text-brand-purple font-black text-xs uppercase tracking-widest mb-1">Step 3 of 3</p>
            <p className="text-brand-white font-bold text-sm">The math tells you how many shares</p>
            <p className="text-brand-muted text-xs mt-1 leading-relaxed">
              You're not guessing a quantity. You're asking: "How many ${riskPerShare.toFixed(2)} losses can I take before I hit my ${maxRisk.toFixed(0)} limit?"
            </p>
          </div>

          <div className="bg-brand-surface border border-white/10 rounded-2xl overflow-hidden">
            {/* Step A */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-brand-muted text-xs mb-1">Your loss limit (from Step 1)</p>
              <div className="flex justify-between items-center">
                <span className="text-brand-white text-sm">${account.toLocaleString()} × 1%</span>
                <span className="text-brand-purple font-black text-xl">${maxRisk.toFixed(0)}</span>
              </div>
            </div>

            {/* Step B */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-brand-muted text-xs mb-1">Your loss per share (from Step 2)</p>
              <div className="flex justify-between items-center">
                <span className="text-brand-white text-sm">${stock.toFixed(2)} − ${stop.toFixed(2)}</span>
                <span className="text-brand-error font-black text-xl">−${riskPerShare.toFixed(2)}</span>
              </div>
            </div>

            {/* The division */}
            <div className="px-4 py-4 bg-white/5">
              <p className="text-brand-muted text-xs mb-2 text-center">How many ${riskPerShare.toFixed(2)} losses fit inside ${maxRisk.toFixed(0)}?</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-brand-purple font-black text-2xl">${maxRisk.toFixed(0)}</p>
                  <p className="text-brand-muted text-xs">max loss</p>
                </div>
                <span className="text-brand-muted text-2xl font-light">÷</span>
                <div className="text-center">
                  <p className="text-brand-error font-black text-2xl">${riskPerShare.toFixed(2)}</p>
                  <p className="text-brand-muted text-xs">per share</p>
                </div>
                <span className="text-brand-muted text-2xl font-light">=</span>
                <div className="text-center">
                  <p className="text-brand-green font-black text-3xl">{shares}</p>
                  <p className="text-brand-muted text-xs">shares</p>
                </div>
              </div>
            </div>

            {/* Proof */}
            <div className="px-4 py-3 bg-brand-green/10 border-t border-brand-green/20">
              <p className="text-brand-muted text-xs mb-1 text-center">Proof it works</p>
              <p className="text-brand-green text-sm font-bold text-center">
                {shares} shares × ${riskPerShare.toFixed(2)} loss = <span className="font-black">${actualLoss.toFixed(0)} total loss</span>
              </p>
              <p className="text-brand-muted text-xs text-center mt-0.5">
                ${actualLoss.toFixed(0)} ÷ ${account.toLocaleString()} = <span className="text-brand-green font-bold">{((actualLoss / account) * 100).toFixed(1)}%</span> of your account 🛡️
              </p>
            </div>
          </div>

          <div className="bg-brand-surface border border-white/10 rounded-2xl px-4 py-3">
            <div className="flex justify-between text-sm">
              <span className="text-brand-muted">Shares to buy</span>
              <span className="text-brand-white font-bold">{shares}</span>
            </div>
            <div className="flex justify-between text-sm mt-1.5">
              <span className="text-brand-muted">Total invested</span>
              <span className="text-brand-white font-bold">${totalCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-1.5">
              <span className="text-brand-muted">Worst case loss</span>
              <span className="text-brand-error font-bold">−${actualLoss.toFixed(0)}</span>
            </div>
          </div>

          <button onClick={reset} className="w-full text-brand-muted text-sm py-3 rounded-2xl border border-white/10 active:scale-95 transition-all">
            Try different numbers ↺
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Portfolio Diversification ────────────────────────────────────
function PortfolioDemo() {
  const SECTORS = [
    { name: 'Tech', emoji: '💻', color: 'bg-brand-purple' },
    { name: 'Health', emoji: '🏥', color: 'bg-brand-green' },
    { name: 'Consumer', emoji: '🛍️', color: 'bg-yellow-400' },
    { name: 'Energy', emoji: '⚡', color: 'bg-orange-400' },
    { name: 'Finance', emoji: '🏦', color: 'bg-blue-400' },
  ]
  const [diversified, setDiversified] = useState(false)

  const alloc = diversified ? [35, 25, 20, 10, 10] : [100, 0, 0, 0, 0]
  const active = alloc.filter(a => a > 0).length
  const riskLabel = active <= 1 ? 'High Risk' : active <= 2 ? 'Medium Risk' : 'Lower Risk'
  const riskColor = active <= 1 ? 'text-brand-error' : active <= 2 ? 'text-yellow-400' : 'text-brand-green'
  const riskBg = active <= 1 ? 'bg-brand-error/20 border-brand-error' : active <= 2 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-brand-green/20 border-brand-green'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {SECTORS.map((s, i) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-base w-6">{s.emoji}</span>
            <span className="text-brand-muted text-xs w-16">{s.name}</span>
            <div className="flex-1 bg-brand-surface rounded-full h-4 overflow-hidden border border-white/10">
              <div className={`h-full rounded-full transition-all duration-700 ${s.color}`} style={{ width: `${alloc[i]}%` }} />
            </div>
            <span className="text-brand-white text-xs font-bold w-9 text-right">{alloc[i]}%</span>
          </div>
        ))}
      </div>

      <div className={`rounded-2xl border px-4 py-3 text-center transition-all duration-500 ${riskBg}`}>
        <p className={`font-black text-base ${riskColor}`}>{riskLabel}</p>
        <p className="text-brand-muted text-xs mt-0.5 leading-relaxed">
          {active <= 1 ? 'One sector crash wipes your whole portfolio' : active <= 2 ? 'Better — but still exposed to sector risk' : 'Spread out — one sector dropping won\'t wreck you'}
        </p>
      </div>

      <button
        onClick={() => { haptics.tap(); setDiversified(d => !d) }}
        className={`w-full font-black text-sm py-3.5 rounded-2xl active:scale-95 transition-all ${
          diversified ? 'bg-brand-surface border border-white/10 text-brand-muted' : 'bg-brand-purple text-brand-white shadow-lg shadow-brand-purple/30'
        }`}
      >
        {diversified ? '← Reset to all-tech' : 'Diversify across sectors →'}
      </button>
    </div>
  )
}

// ─── Options Chain ────────────────────────────────────────────────
const STOCK_PRICE = 142

const CHAIN_ROWS = [
  { strike: 135, callBid: 8.40, callAsk: 8.70, callVol: 1240, callOI: 4580, putBid: 1.20, putAsk: 1.40, putVol: 320, putOI: 1120 },
  { strike: 140, callBid: 4.90, callAsk: 5.20, callVol: 3810, callOI: 9200, putBid: 2.80, putAsk: 3.05, putVol: 1640, putOI: 5300 },
  { strike: 142, callBid: 3.30, callAsk: 3.55, callVol: 5920, callOI: 14200, putBid: 3.25, putAsk: 3.50, putVol: 2100, putOI: 7800 },
  { strike: 145, callBid: 1.85, callAsk: 2.10, callVol: 4320, callOI: 11400, putBid: 4.70, putAsk: 4.95, putVol: 880, putOI: 3200 },
  { strike: 150, callBid: 0.55, callAsk: 0.75, callVol: 720, callOI: 2100, putBid: 8.30, putAsk: 8.60, putVol: 210, putOI: 890 },
]

function OptionsChainDemo() {
  const [selected, setSelected] = useState<{ strike: number; side: 'call' | 'put' } | null>(null)

  function tap(strike: number, side: 'call' | 'put') {
    haptics.tap()
    setSelected(prev => prev?.strike === strike && prev?.side === side ? null : { strike, side })
  }

  const sel = selected
    ? CHAIN_ROWS.find(r => r.strike === selected.strike)
    : null

  return (
    <div className="flex flex-col gap-4">

      {/* Price reference */}
      <div className="flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-brand-muted text-xs font-semibold">Stock price: <span className="text-brand-white font-black">${STOCK_PRICE}</span></span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* Chain header */}
      <div className="grid grid-cols-7 text-center">
        <span className="col-span-3 text-blue-400 text-xs font-black uppercase tracking-wide">Calls</span>
        <span className="text-brand-muted text-xs font-bold uppercase">Strike</span>
        <span className="col-span-3 text-brand-error text-xs font-black uppercase tracking-wide">Puts</span>
      </div>
      <div className="grid grid-cols-7 text-center text-brand-muted text-xs mb-1">
        <span>Bid</span><span>Ask</span><span>Vol</span>
        <span></span>
        <span>Bid</span><span>Ask</span><span>Vol</span>
      </div>

      {/* Rows */}
      {CHAIN_ROWS.map(row => {
        const isATM = row.strike === STOCK_PRICE
        const callSel = selected?.strike === row.strike && selected?.side === 'call'
        const putSel = selected?.strike === row.strike && selected?.side === 'put'

        return (
          <div
            key={row.strike}
            className={`grid grid-cols-7 text-center items-center rounded-xl py-2 transition-all ${isATM ? 'bg-white/5 border border-white/10' : ''}`}
          >
            {/* Call side */}
            <button
              onClick={() => tap(row.strike, 'call')}
              className={`col-span-3 grid grid-cols-3 rounded-lg py-1.5 transition-all active:scale-95 ${callSel ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
            >
              <span className={`text-xs font-bold ${callSel ? 'text-blue-300' : 'text-brand-muted'}`}>{row.callBid.toFixed(2)}</span>
              <span className={`text-xs font-bold ${callSel ? 'text-blue-400' : 'text-brand-white'}`}>{row.callAsk.toFixed(2)}</span>
              <span className="text-xs text-brand-muted/60">{row.callVol >= 1000 ? `${(row.callVol / 1000).toFixed(1)}k` : row.callVol}</span>
            </button>

            {/* Strike */}
            <span className={`text-xs font-black ${isATM ? 'text-brand-white' : 'text-brand-muted'}`}>
              {row.strike}
              {isATM && <span className="block text-brand-purple text-xs font-bold leading-none">ATM</span>}
            </span>

            {/* Put side */}
            <button
              onClick={() => tap(row.strike, 'put')}
              className={`col-span-3 grid grid-cols-3 rounded-lg py-1.5 transition-all active:scale-95 ${putSel ? 'bg-brand-error/20' : 'hover:bg-white/5'}`}
            >
              <span className={`text-xs font-bold ${putSel ? 'text-red-300' : 'text-brand-muted'}`}>{row.putBid.toFixed(2)}</span>
              <span className={`text-xs font-bold ${putSel ? 'text-brand-error' : 'text-brand-white'}`}>{row.putAsk.toFixed(2)}</span>
              <span className="text-xs text-brand-muted/60">{row.putVol >= 1000 ? `${(row.putVol / 1000).toFixed(1)}k` : row.putVol}</span>
            </button>
          </div>
        )
      })}

      {/* Detail panel */}
      {sel && selected && (
        <div className={`rounded-2xl border px-4 py-3 animate-slideUp ${selected.side === 'call' ? 'bg-blue-500/10 border-blue-500/40' : 'bg-brand-error/10 border-brand-error/40'}`}>
          <p className={`font-black text-xs uppercase tracking-widest mb-2 ${selected.side === 'call' ? 'text-blue-400' : 'text-brand-error'}`}>
            ${selected.strike} {selected.side === 'call' ? 'Call' : 'Put'} · {selected.strike < STOCK_PRICE ? 'ITM' : selected.strike === STOCK_PRICE ? 'ATM' : 'OTM'}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-brand-muted">Buy at (ask)</p>
              <p className="text-brand-white font-black text-base">${(selected.side === 'call' ? sel.callAsk : sel.putAsk).toFixed(2)}</p>
              <p className="text-brand-muted mt-0.5">= ${((selected.side === 'call' ? sel.callAsk : sel.putAsk) * 100).toFixed(0)} per contract</p>
            </div>
            <div>
              <p className="text-brand-muted">Open Interest</p>
              <p className="text-brand-white font-black text-base">{(selected.side === 'call' ? sel.callOI : sel.putOI).toLocaleString()}</p>
              <p className={`mt-0.5 font-bold ${(selected.side === 'call' ? sel.callOI : sel.putOI) >= 500 ? 'text-brand-green' : 'text-brand-error'}`}>
                {(selected.side === 'call' ? sel.callOI : sel.putOI) >= 500 ? '✓ Liquid' : '⚠ Low liquidity'}
              </p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <p className="text-brand-muted text-xs">Spread cost: <span className="text-brand-white font-bold">${((selected.side === 'call' ? sel.callAsk - sel.callBid : sel.putAsk - sel.putBid) * 100).toFixed(0)}</span> per contract — paid on entry</p>
          </div>
        </div>
      )}

      {!selected && (
        <p className="text-brand-muted text-xs text-center">Tap any row to see contract details</p>
      )}
    </div>
  )
}

// ─── Theta Decay ──────────────────────────────────────────────────
function ThetaDecayDemo() {
  const PREMIUM = 200
  const DAYS = 60

  // Theta decay: time value = premium * sqrt(DTE/60) approximation for visual curve
  function valueAt(dte: number) {
    return Math.round(PREMIUM * Math.sqrt(dte / DAYS))
  }

  const [currentDTE, setCurrentDTE] = useState(60)
  const currentValue = valueAt(currentDTE)
  const lost = PREMIUM - currentValue
  const lostPct = Math.round((lost / PREMIUM) * 100)

  // Build bar chart data — show every 10 days
  const BARS = [60, 50, 40, 30, 20, 14, 7, 3, 0]

  function advance() {
    haptics.tap()
    setCurrentDTE(d => {
      if (d >= 50) return d - 10
      if (d === 40) return 30
      if (d === 30) return 20
      if (d === 20) return 14
      if (d === 14) return 7
      if (d === 7) return 3
      if (d === 3) return 0
      return 0
    })
  }

  function reset() { haptics.tap(); setCurrentDTE(60) }

  const isDangerous = currentDTE <= 14
  const isAlmostGone = currentDTE <= 3

  return (
    <div className="flex flex-col gap-4">

      {/* Main display */}
      <div className={`rounded-2xl border-2 px-5 py-4 text-center transition-all duration-500 ${
        isAlmostGone ? 'bg-brand-error/10 border-brand-error' :
        isDangerous ? 'bg-yellow-500/10 border-yellow-500' :
        'bg-brand-surface border-white/10'
      }`}>
        <p className="text-brand-muted text-xs mb-1">{currentDTE} days to expiration</p>
        <p className={`font-black text-4xl transition-all duration-500 ${
          isAlmostGone ? 'text-brand-error' : isDangerous ? 'text-yellow-400' : 'text-brand-white'
        }`}>${currentValue}</p>
        <p className="text-brand-muted text-xs mt-1">option value remaining</p>
        {lost > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-brand-error text-sm font-bold">−${lost} lost to theta ({lostPct}%)</p>
            {isDangerous && !isAlmostGone && <p className="text-yellow-400 text-xs mt-1 font-semibold">⚠ Decay is accelerating — dangerous zone</p>}
            {isAlmostGone && <p className="text-brand-error text-xs mt-1 font-semibold">🚨 Last days — theta is brutal here</p>}
          </div>
        )}
      </div>

      {/* Bar visualization */}
      <div className="flex items-end gap-1.5 h-20">
        {BARS.map(dte => {
          const val = valueAt(dte)
          const heightPct = (val / PREMIUM) * 100
          const isPast = dte > currentDTE
          const isCurrent = dte === currentDTE
          const isRed = dte <= 14

          return (
            <div key={dte} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end" style={{ height: 60 }}>
                <div
                  className={`w-full rounded-t transition-all duration-500 ${
                    isPast ? 'bg-white/5' :
                    isCurrent ? (isRed ? 'bg-brand-error' : 'bg-brand-purple') :
                    isRed ? 'bg-brand-error/40' : 'bg-brand-purple/30'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className={`text-xs ${isCurrent ? 'text-brand-white font-black' : isPast ? 'text-white/20' : 'text-brand-muted/50'}`}>
                {dte}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-brand-muted/50 text-xs text-center -mt-2">Days to expiration →</p>

      {/* Controls */}
      <div className="flex gap-2">
        {currentDTE > 0 ? (
          <button
            onClick={advance}
            className="flex-1 bg-brand-purple text-brand-white font-black py-3 rounded-2xl active:scale-95 transition-all text-sm"
          >
            Advance Time →
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex-1 bg-brand-surface border border-white/10 text-brand-muted font-bold py-3 rounded-2xl active:scale-95 text-sm"
          >
            Reset ↺
          </button>
        )}
      </div>

      {currentDTE === 0 && (
        <div className="bg-brand-error/20 border border-brand-error rounded-2xl px-4 py-3 text-center animate-slideUp">
          <p className="text-brand-error font-black text-sm">Option expired worthless</p>
          <p className="text-brand-muted text-xs mt-1">$200 → $0. Every day you hold, theta takes its cut.</p>
        </div>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────
interface DemoSlideProps {
  demoType: string
  heading: string
}

export function DemoSlide({ demoType, heading }: DemoSlideProps) {
  return (
    <div className="flex flex-col gap-5 animate-slideIn">
      <div className="text-center">
        <span className="inline-block bg-brand-purple/20 border border-brand-purple/40 text-brand-purple text-xs font-bold px-3 py-1 rounded-full mb-3">
          ✦ Try it
        </span>
        <h2 className="text-xl font-black text-brand-white leading-snug">{heading}</h2>
      </div>
      {demoType === 'company-split' && <PlaceOrderDemo />}
      {demoType === 'supply-demand' && <SupplyDemandDemo />}
      {demoType === 'savings-vs-investing' && <SavingsVsInvestingDemo />}
      {demoType === 'price-range' && <PriceRangeDemo />}
      {demoType === 'bull-bear' && <BullBearDemo />}
      {demoType === 'dca' && <DCADemo />}
      {demoType === 'portfolio-bars' && <PortfolioDemo />}
      {demoType === 'candlestick-anatomy' && <CandlestickAnatomyDemo />}
      {demoType === 'position-sizing' && <PositionSizingDemo />}
      {demoType === 'options-chain' && <OptionsChainDemo />}
      {demoType === 'theta-decay' && <ThetaDecayDemo />}
    </div>
  )
}
