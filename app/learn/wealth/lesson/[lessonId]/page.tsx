'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getCurrentUser, updateUser } from '@/lib/auth'
import { WEALTH_UNITS } from '@/lib/wealth-lessons'
import { LessonPlayer } from '@/components/LessonPlayer'
import { celebrateLevelUp } from '@/lib/celebrate'
import { haptics } from '@/lib/haptics'
import type { Lesson } from '@/lib/starter-lessons'

const PROGRESS_KEY = 'stockly_wealth_progress'
const XP_KEY = 'stockly_wealth_xp'

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveProgress(lessonId: string) {
  const p = loadProgress()
  p[lessonId] = true
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
}

function addXP(amount: number): number {
  const current = parseInt(localStorage.getItem(XP_KEY) ?? '0', 10)
  const next = current + amount
  localStorage.setItem(XP_KEY, String(next))
  return next
}

export default function WealthLessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push('/auth'); return }

    let found: Lesson | null = null
    for (const unit of WEALTH_UNITS) {
      const l = unit.lessons.find((l) => l.id === lessonId)
      if (l) { found = l; break }
    }

    if (!found) { setNotFound(true); return }
    setLesson(found)
  }, [lessonId, router])

  function handleComplete(xp: number) {
    saveProgress(lessonId)
    const totalXP = addXP(xp)

    if (totalXP >= 100 && totalXP - xp < 100) {
      haptics.levelUp()
      celebrateLevelUp()
    }

    updateUser({ onboardingStep: '/learn/wealth' })
    router.push('/learn/wealth')
  }

  if (notFound) {
    return (
      <div className="max-w-sm mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">🤔</div>
        <h2 className="text-brand-white font-black text-xl mb-2">Lesson not found</h2>
        <button onClick={() => router.push('/learn/wealth')} className="text-brand-purple font-bold">
          ← Back to track
        </button>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="max-w-sm mx-auto px-6 py-20 flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-brand-purple animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <LessonPlayer
      lesson={lesson}
      onComplete={handleComplete}
      backHref="/learn/wealth"
    />
  )
}
