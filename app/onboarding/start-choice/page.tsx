'use client'

import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

export default function StartChoicePage() {
  const router = useRouter()

  function handleSelect(choice: 'basics' | 'test') {
    haptics.tap()
    localStorage.setItem('stockly_start_choice', choice)
    if (choice === 'basics') {
      router.push('/onboarding/course-ready')
    } else {
      router.push('/onboarding/knowledge-check')
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-10 animate-slideUp">
        <div className="text-5xl mb-3">🤔</div>
        <h1 className="text-2xl font-black text-brand-white mb-2">How do you want to start?</h1>
        <p className="text-brand-muted text-sm">Either way, Stockly builds your path around you.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1 justify-center">

        <button
          onClick={() => handleSelect('basics')}
          className="flex flex-col gap-2 p-6 rounded-3xl border-2 border-white/20 bg-brand-surface text-left active:scale-95 transition-all"
        >
          <div className="text-3xl mb-1">🌱</div>
          <p className="text-brand-white font-black text-lg">Start from the basics</p>
          <p className="text-brand-muted text-sm">We'll walk you through everything from the ground up. No experience needed.</p>
        </button>

        <button
          onClick={() => handleSelect('test')}
          className="flex flex-col gap-2 p-6 rounded-3xl border-2 border-brand-purple bg-brand-purple/10 text-left active:scale-95 transition-all"
        >
          <div className="text-3xl mb-1">⚡</div>
          <p className="text-brand-white font-black text-lg">Test my knowledge</p>
          <p className="text-brand-muted text-sm">Take a quick quiz and we'll skip what you already know.</p>
        </button>

      </div>

    </div>
  )
}
