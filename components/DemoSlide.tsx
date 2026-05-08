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
    </div>
  )
}
