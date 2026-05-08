'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { getCurrentUser } from '@/lib/auth'
import { BUILDER_UNITS } from '@/lib/builder-lessons'
import { StocklyLogo } from '@/components/StocklyLogo'
import { HamburgerMenu } from '@/components/HamburgerMenu'

const PROGRESS_KEY = 'stockly_builder_progress'

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function BuilderTrackPage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [progress, setProgress] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push('/auth'); return }
    setUserName(user.name.split(' ')[0])
    setUserPlan(user.plan)
    setProgress(loadProgress())
  }, [router])

  const totalLessons = BUILDER_UNITS.reduce((acc, u) => acc + u.lessons.length, 0)
  const completedCount = Object.values(progress).filter(Boolean).length
  const overallPct = Math.round((completedCount / totalLessons) * 100)

  function getLessonState(lessonId: string, unitIndex: number, lessonIndex: number) {
    if (progress[lessonId]) return 'complete'
    if (unitIndex === 0 && lessonIndex === 0) return 'available'
    const units = BUILDER_UNITS
    let prevId: string | null = null
    if (lessonIndex > 0) {
      prevId = units[unitIndex].lessons[lessonIndex - 1].id
    } else if (unitIndex > 0) {
      const prevUnit = units[unitIndex - 1]
      prevId = prevUnit.lessons[prevUnit.lessons.length - 1].id
    }
    return prevId && progress[prevId] ? 'available' : 'locked'
  }

  function handleLesson(lessonId: string, state: string) {
    if (state === 'locked') { haptics.wrong(); return }
    haptics.tap()
    router.push(`/learn/builder/lesson/${lessonId}`)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-6 pb-20">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HamburgerMenu userName={userName} userPlan={userPlan} />
        <div className="flex items-center -space-x-1">
          <StocklyLogo size={28} />
          <span className="text-xl font-black text-brand-white tracking-tight leading-none">tockly</span>
        </div>
        <button onClick={() => router.push('/learn')} className="text-brand-muted text-sm active:scale-95 w-8 text-right">
          ✕
        </button>
      </div>

      {/* Track hero */}
      <div className="bg-brand-purple/20 border-2 border-brand-purple rounded-3xl p-5 mb-6 animate-slideUp">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">🔨</div>
          <div>
            <h1 className="text-xl font-black text-brand-white">Builder Track</h1>
            <p className="text-brand-muted text-xs">Research, analyze, and trade with confidence.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div
              className="bg-brand-green h-2 rounded-full transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <span className="text-brand-green font-bold text-xs">{overallPct}%</span>
        </div>
        <p className="text-brand-muted text-xs mt-1">{completedCount}/{totalLessons} lessons complete</p>
      </div>

      {/* Units */}
      {BUILDER_UNITS.map((unit, ui) => {
        const unitCompleted = unit.lessons.every((l) => progress[l.id])
        return (
          <div key={unit.id} className="mb-8 animate-slideIn">

            <div className={`rounded-2xl border-2 ${unit.borderColor} ${unit.color} px-5 py-4 mb-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-muted text-xs font-semibold uppercase tracking-wide">Unit {ui + 1}</p>
                  <h2 className="text-brand-white font-black text-base">{unit.title}</h2>
                  <p className="text-brand-muted text-xs mt-0.5">{unit.subtitle}</p>
                </div>
                {unitCompleted && <span className="text-2xl">✅</span>}
              </div>
            </div>

            <div className="flex flex-col gap-3 pl-2">
              {unit.lessons.map((lesson, li) => {
                const state = getLessonState(lesson.id, ui, li)
                const isComplete = state === 'complete'
                const isLocked = state === 'locked'

                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLesson(lesson.id, state)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      isComplete
                        ? 'bg-brand-green/10 border-brand-green'
                        : isLocked
                        ? 'bg-brand-surface/50 border-white/5 opacity-50'
                        : 'bg-brand-surface border-brand-purple shadow-lg shadow-brand-purple/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      isComplete ? 'bg-brand-green/20' : isLocked ? 'bg-white/5' : 'bg-brand-purple/20'
                    }`}>
                      {isComplete ? '✅' : isLocked ? '🔒' : lesson.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold text-sm ${isLocked ? 'text-brand-muted' : 'text-brand-white'}`}>
                        {lesson.title}
                      </p>
                      <p className="text-brand-muted text-xs mt-0.5">
                        {isComplete ? 'Complete' : isLocked ? 'Locked' : `${lesson.slides.length} slides · ${lesson.xpReward} XP`}
                      </p>
                    </div>
                    {!isLocked && (
                      <span className={`text-sm font-bold flex-shrink-0 ${isComplete ? 'text-brand-green' : 'text-brand-purple'}`}>
                        {isComplete ? '★' : '→'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {completedCount === totalLessons && totalLessons > 0 && (
        <div className="bg-brand-green/20 border-2 border-brand-green rounded-3xl p-6 text-center animate-levelBurst">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-brand-white font-black text-xl mb-2">Builder Track Complete!</h2>
          <p className="text-brand-muted text-sm">You can research, analyze, and trade. You're ready for the Leveler track.</p>
        </div>
      )}

    </div>
  )
}
