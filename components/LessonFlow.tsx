'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LESSON_SLIDES } from '@/lib/constants'
import { useGameState } from '@/hooks/useGameState'
import { LessonCard } from './LessonCard'
import { XPPopup } from './XPPopup'

export function LessonFlow() {
  const router = useRouter()
  const { addXP, completeLesson } = useGameState()
  const [slideIndex, setSlideIndex] = useState(0)
  const [pendingXP, setPendingXP] = useState<number | null>(null)

  const slide = LESSON_SLIDES[slideIndex]
  const isFirst = slideIndex === 0
  const isLast = slideIndex === LESSON_SLIDES.length - 1

  const handleNext = (earnedXP = 0) => {
    if (earnedXP > 0) {
      addXP(earnedXP)
      setPendingXP(earnedXP)
      // Wait for popup animation before advancing
      setTimeout(() => {
        setPendingXP(null)
        advance(earnedXP)
      }, 1200)
    } else {
      advance(0)
    }
  }

  const advance = (xpEarned: number) => {
    if (isLast) {
      const bonusXP = 40
      addXP(bonusXP)
      completeLesson()
      setPendingXP(bonusXP)
      setTimeout(() => {
        setPendingXP(null)
        router.push('/')
      }, 1500)
    } else {
      setSlideIndex((i) => i + 1)
    }
  }

  const handleBack = () => {
    if (!isFirst) setSlideIndex((i) => i - 1)
  }

  // Dot progress indicator
  const dots = LESSON_SLIDES.map((_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full transition-all duration-300 ${
        i < slideIndex ? 'bg-brand-blue' : i === slideIndex ? 'bg-brand-blue scale-125' : 'bg-gray-300'
      }`}
    />
  ))

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-6">{dots}</div>

      {/* Slide */}
      <LessonCard
        key={slide.id}
        slide={slide}
        isFirst={isFirst}
        isLast={isLast}
        onNext={handleNext}
        onBack={handleBack}
      />

      {/* XP popup for mid-lesson rewards */}
      {pendingXP !== null && (
        <XPPopup amount={pendingXP} onComplete={() => setPendingXP(null)} />
      )}
    </div>
  )
}
