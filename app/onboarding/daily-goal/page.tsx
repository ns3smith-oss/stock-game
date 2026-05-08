'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

const OPTIONS = [
  { icon: '⚡', label: '5 minutes', sub: 'Quick and consistent' },
  { icon: '🔥', label: '10 minutes', sub: 'Steady momentum' },
  { icon: '💪', label: '15 minutes', sub: 'Serious about it' },
  { icon: '🚀', label: '20+ minutes', sub: "Let's get it" },
]

export default function DailyGoalPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  function handleSelect(i: number) {
    haptics.tap()
    setSelected(i)
  }

  function handleContinue() {
    if (selected === null) return
    haptics.success()
    localStorage.setItem('stockly_daily_goal', OPTIONS[selected].label)
    router.push('/onboarding/hype')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-10 animate-slideUp">
        <div className="text-5xl mb-3">🎯</div>
        <h1 className="text-2xl font-black text-brand-white mb-2">Set your daily goal</h1>
        <p className="text-brand-muted text-sm">Small steps every day beat big steps never.</p>
      </div>

      <div className="flex flex-col gap-3 flex-1">
        {OPTIONS.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
              selected === i
                ? 'border-brand-green bg-brand-green/10 text-brand-white'
                : 'border-white/20 bg-brand-surface text-brand-white'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div className="text-left">
              <p className="font-bold text-sm">{opt.label}</p>
              <p className="text-brand-muted text-xs">{opt.sub}</p>
            </div>
            {selected === i && <span className="ml-auto text-brand-green text-lg">✓</span>}
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
