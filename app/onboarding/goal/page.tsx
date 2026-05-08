'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

const OPTIONS = [
  { icon: '📊', label: 'Learn stock market basics' },
  { icon: '⚡', label: 'Learn options trading' },
  { icon: '🔮', label: 'Learn futures trading' },
  { icon: '💼', label: 'Build and manage a portfolio' },
  { icon: '📉', label: 'Understand market trends & analysis' },
  { icon: '🔥', label: 'All of the above — I want everything' },
]

export default function GoalPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  function handleSelect(i: number) {
    haptics.tap()
    setSelected(i)
  }

  function handleContinue() {
    if (selected === null) return
    haptics.success()
    localStorage.setItem('stockly_goal', OPTIONS[selected].label)
    router.push('/onboarding/referral')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-8 animate-slideUp">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-2xl font-black text-brand-white mb-2">What do you want to learn?</h1>
        <p className="text-brand-muted text-sm">Pick one to start — you can always explore more later.</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {OPTIONS.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 ${
              selected === i
                ? 'border-brand-green bg-brand-green/10 text-brand-white'
                : 'border-white/20 bg-brand-surface text-brand-white'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span>{opt.label}</span>
            {selected === i && <span className="ml-auto text-brand-green">✓</span>}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        className={`w-full font-black text-xl py-5 rounded-2xl mt-6 transition-all active:scale-95 ${
          selected !== null
            ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/30'
            : 'bg-brand-surface text-brand-muted border border-white/10'
        }`}
      >
        Continue →
      </button>

    </div>
  )
}
