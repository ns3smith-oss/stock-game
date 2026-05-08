'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

const OPTIONS = [
  { icon: '💰', label: 'Build personal wealth' },
  { icon: '🔓', label: 'Achieve financial freedom' },
  { icon: '😤', label: "Because nobody ever taught me and I'm tired of being left out" },
  { icon: '💸', label: 'Create a new income stream' },
  { icon: '🤓', label: 'I just want to know how it all works' },
]

export default function WhyPage() {
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  function handleSelect(i: number) {
    haptics.tap()
    setSelected(i)
    setTimeout(() => {
      localStorage.setItem('stockly_why', OPTIONS[i].label)
      router.push('/onboarding/routine')
    }, 400)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-10 animate-slideUp">
        <div className="text-5xl mb-3">💡</div>
        <h1 className="text-2xl font-black text-brand-white mb-2">Why are you here?</h1>
        <p className="text-brand-muted text-sm">Your reason is valid. All of them are.</p>
      </div>

      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            className={`flex items-start gap-4 px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 text-left ${
              selected === i
                ? 'border-brand-green bg-brand-green text-brand-black scale-95'
                : selected !== null
                ? 'border-white/10 bg-brand-surface text-brand-muted opacity-40'
                : 'border-white/20 bg-brand-surface text-brand-white'
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

    </div>
  )
}
