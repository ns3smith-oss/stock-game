'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { celebrateCourseReady } from '@/lib/celebrate'

export default function CourseReadyPage() {
  const router = useRouter()

  const level = typeof window !== 'undefined' ? localStorage.getItem('stockly_level') ?? 'starter' : 'starter'
  const goal = typeof window !== 'undefined' ? localStorage.getItem('stockly_goal') ?? 'Learn stock market basics' : 'Learn stock market basics'
  const dailyGoal = typeof window !== 'undefined' ? localStorage.getItem('stockly_daily_goal') ?? '5 minutes' : '5 minutes'

  const trackNames: Record<string, string> = {
    starter: 'Starter Track 🌱',
    builder: 'Builder Track 🔨',
    leveler: 'Leveler Track 🚀',
  }

  useEffect(() => {
    haptics.levelUp()
    celebrateCourseReady()
  }, [])

  function handleStart() {
    haptics.tap()
    router.push(`/learn/${level}`)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col items-center text-center min-h-screen">

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-brand-purple opacity-15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-levelBurst">

        {/* Mascot */}
        <div className="relative">
          <div className="w-36 h-36 rounded-full bg-brand-surface border-4 border-brand-green flex items-center justify-center shadow-2xl shadow-brand-green/40 animate-bounce">
            <span className="text-7xl">🐂</span>
          </div>
          <div className="absolute -top-3 -right-3 text-4xl animate-pop">⭐</div>
          <div className="absolute -top-3 -left-3 text-4xl animate-pop">⚡</div>
          <div className="absolute -bottom-3 -right-3 text-4xl animate-pop">🔥</div>
        </div>

        <div>
          <p className="text-brand-green font-bold text-sm uppercase tracking-widest mb-2">Your course is ready</p>
          <h1 className="text-3xl font-black text-brand-white mb-4 leading-tight">
            Let's get you<br />to the bag 💸
          </h1>
        </div>

        {/* Course summary card */}
        <div className="w-full bg-brand-surface rounded-3xl p-5 border border-white/10 text-left flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-xs uppercase tracking-wide">Your Track</span>
            <span className="text-brand-green font-bold text-sm">{trackNames[level]}</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-xs uppercase tracking-wide">Focus</span>
            <span className="text-brand-white font-bold text-sm text-right max-w-[60%]">{goal}</span>
          </div>
          <div className="w-full h-px bg-white/10" />
          <div className="flex items-center justify-between">
            <span className="text-brand-muted text-xs uppercase tracking-wide">Daily Goal</span>
            <span className="text-brand-purple font-bold text-sm">{dailyGoal}/day</span>
          </div>
        </div>

      </div>

      <button
        onClick={handleStart}
        className="w-full bg-brand-green text-brand-black font-black text-xl py-5 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform animate-greenGlow"
      >
        Start Learning 🚀
      </button>

    </div>
  )
}
