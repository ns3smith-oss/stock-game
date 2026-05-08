'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { celebrateCorrect } from '@/lib/celebrate'

export default function HypePage() {
  const router = useRouter()

  const why = typeof window !== 'undefined' ? localStorage.getItem('stockly_why') ?? '' : ''
  const goal = typeof window !== 'undefined' ? localStorage.getItem('stockly_daily_goal') ?? '5 minutes' : '5 minutes'

  useEffect(() => {
    haptics.levelUp()
    celebrateCorrect()
  }, [])

  function handleContinue() {
    haptics.tap()
    router.push('/onboarding/plan')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col items-center text-center min-h-screen">

      {/* Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-brand-green opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-slideUp">

        {/* Mascot celebrating */}
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-brand-surface border-4 border-brand-green flex items-center justify-center animate-bounce shadow-2xl shadow-brand-green/40">
            <span className="text-6xl">🐂</span>
          </div>
          <div className="absolute -top-2 -right-2 text-3xl animate-pop">⚡</div>
          <div className="absolute -bottom-2 -left-2 text-3xl animate-pop">🔥</div>
        </div>

        <div>
          <h1 className="text-3xl font-black text-brand-white mb-3 leading-tight">
            You're already<br />
            <span className="text-brand-green">ahead of most people.</span>
          </h1>

          {why.includes('nobody ever taught') ? (
            <p className="text-brand-muted text-base leading-relaxed">
              The fact that you're here means you're already doing what most people won't. That takes courage. Stockly's got you from here.
            </p>
          ) : (
            <p className="text-brand-muted text-base leading-relaxed">
              Every expert was once a beginner. You just took the first step. Just {goal} a day and you'll be surprised how fast things click.
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-brand-surface rounded-2xl p-4 border border-white/10">
            <p className="text-brand-green text-2xl font-black">{goal}</p>
            <p className="text-brand-muted text-xs">daily goal</p>
          </div>
          <div className="flex-1 bg-brand-surface rounded-2xl p-4 border border-white/10">
            <p className="text-brand-green text-2xl font-black">0</p>
            <p className="text-brand-muted text-xs">day streak</p>
          </div>
          <div className="flex-1 bg-brand-surface rounded-2xl p-4 border border-white/10">
            <p className="text-brand-green text-2xl font-black">LVL 1</p>
            <p className="text-brand-muted text-xs">starting rank</p>
          </div>
        </div>

      </div>

      <button
        onClick={handleContinue}
        className="w-full bg-brand-green text-brand-black font-black text-xl py-5 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform animate-greenGlow"
      >
        Let's build 💸
      </button>

    </div>
  )
}
