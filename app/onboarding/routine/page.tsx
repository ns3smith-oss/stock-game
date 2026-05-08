'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

const OPTIONS = [
  { icon: '🌅', label: 'Morning', sub: 'Start the day with a win' },
  { icon: '☀️', label: 'Afternoon', sub: 'Midday grind' },
  { icon: '🌙', label: 'Evening', sub: 'Wind down and level up' },
  { icon: '⚡', label: 'Whenever I can', sub: "Life is busy — that's okay" },
]

export default function RoutinePage() {
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  function handleSelect(i: number) {
    haptics.tap()
    setSelected(i)
    setTimeout(() => {
      localStorage.setItem('stockly_routine', OPTIONS[i].label)
      router.push('/onboarding/daily-goal')
    }, 400)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-10 animate-slideUp">
        <div className="text-5xl mb-3">⏰</div>
        <h1 className="text-2xl font-black text-brand-white mb-2">When do you like to learn?</h1>
        <p className="text-brand-muted text-sm">We'll remind you at the right time.</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 transition-all active:scale-95 ${
              selected === i
                ? 'border-brand-green bg-brand-green text-brand-black scale-95'
                : selected !== null
                ? 'border-white/10 bg-brand-surface text-brand-muted opacity-40'
                : 'border-white/20 bg-brand-surface text-brand-white'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div className="text-left">
              <p className="font-bold text-sm">{opt.label}</p>
              <p className={`text-xs ${selected === i ? 'text-brand-black/70' : 'text-brand-muted'}`}>{opt.sub}</p>
            </div>
          </button>
        ))}
      </div>

    </div>
  )
}
