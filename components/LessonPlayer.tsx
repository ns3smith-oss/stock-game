'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { celebrateCorrect } from '@/lib/celebrate'
import type { Lesson, Slide } from '@/lib/starter-lessons'

interface LessonPlayerProps {
  lesson: Lesson
  onComplete: (xp: number) => void
  backHref: string
}

export function LessonPlayer({ lesson, onComplete, backHref }: LessonPlayerProps) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [tapped, setTapped] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  const slide = lesson.slides[slideIndex]
  const isLast = slideIndex === lesson.slides.length - 1
  const progress = ((slideIndex + 1) / lesson.slides.length) * 100

  function nextSlide() {
    haptics.tap()
    setTapped(false)
    setSelected(null)
    setRevealed(false)
    if (isLast) {
      onComplete(lesson.xpReward)
    } else {
      setSlideIndex(slideIndex + 1)
    }
  }

  function handleTap() {
    haptics.tap()
    setTapped(true)
  }

  function handleQuizSelect(i: number) {
    if (revealed) return
    haptics.tap()
    setSelected(i)
    setRevealed(true)

    const isCorrect = i === slide.quiz!.correctIndex
    if (isCorrect) {
      haptics.correct()
      celebrateCorrect()
    } else {
      haptics.wrong()
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
  }

  function renderSlide(s: Slide) {
    switch (s.type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center text-center gap-6 animate-slideUp">
            <div className="text-8xl">{s.emoji}</div>
            <h1 className="text-3xl font-black text-brand-white leading-tight">{s.heading}</h1>
            <p className="text-brand-muted text-base leading-relaxed">{s.body}</p>
          </div>
        )

      case 'text':
        return (
          <div className="flex flex-col items-center text-center gap-6 animate-slideIn">
            <div className="text-7xl">{s.emoji}</div>
            <h2 className="text-2xl font-black text-brand-white leading-snug">{s.heading}</h2>
            <p className="text-brand-muted text-base leading-relaxed">{s.body}</p>
          </div>
        )

      case 'fact':
        return (
          <div className="flex flex-col gap-4 animate-slideIn">
            <div className="text-center text-6xl mb-2">{s.emoji}</div>
            <div className="bg-brand-purple/20 border-2 border-brand-purple rounded-3xl p-6">
              <h2 className="text-brand-white font-black text-xl mb-3 text-center">{s.heading}</h2>
              <p className="text-brand-muted text-base leading-relaxed text-center">{s.body}</p>
            </div>
          </div>
        )

      case 'tap-reveal':
        return (
          <div className="flex flex-col items-center text-center gap-6 animate-slideIn">
            <div className="text-7xl">{s.emoji}</div>
            <h2 className="text-2xl font-black text-brand-white leading-snug">{s.heading}</h2>
            {!tapped ? (
              <button
                onClick={handleTap}
                className="w-full bg-brand-surface border-2 border-brand-purple rounded-3xl p-6 active:scale-95 transition-transform animate-pulseGlow"
              >
                <p className="text-brand-muted text-base">{s.body}</p>
                <p className="text-brand-purple font-bold mt-3">Tap to reveal ✨</p>
              </button>
            ) : (
              <div className="w-full bg-brand-purple/20 border-2 border-brand-purple rounded-3xl p-6 animate-slideUp">
                <p className="text-brand-white text-base leading-relaxed">{s.tapReveal}</p>
              </div>
            )}
          </div>
        )

      case 'quiz':
        return (
          <div className="flex flex-col gap-5 animate-slideIn">
            <h2 className="text-xl font-black text-brand-white text-center leading-snug">{s.quiz!.question}</h2>
            <div className="flex flex-col gap-3">
              {s.quiz!.options.map((opt, i) => {
                const isCorrect = i === s.quiz!.correctIndex
                const isSelected = selected === i
                let cls = 'border-white/20 bg-brand-surface text-brand-white'
                if (revealed) {
                  if (isCorrect) cls = 'border-brand-green bg-brand-green/20 text-brand-white'
                  else if (isSelected) cls = 'border-brand-error bg-brand-error/20 text-brand-white'
                  else cls = 'border-white/10 bg-brand-surface text-brand-muted opacity-40'
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleQuizSelect(i)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${cls} ${
                      !revealed ? 'active:scale-95' : ''
                    } ${shake && isSelected && !isCorrect ? 'animate-shake' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      {revealed && isCorrect && <span>✅</span>}
                      {revealed && isSelected && !isCorrect && <span>❌</span>}
                      {opt}
                    </span>
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div className="bg-brand-surface rounded-2xl p-4 border border-white/10 animate-slideUp">
                <p className="text-brand-muted text-sm leading-relaxed">
                  <span className="text-brand-white font-bold">Why: </span>
                  {s.quiz!.explanation}
                </p>
              </div>
            )}
          </div>
        )

      case 'complete':
        return (
          <div className="flex flex-col items-center text-center gap-6 animate-levelBurst">
            <div className="text-8xl animate-bounce">{s.emoji}</div>
            <div>
              <h2 className="text-3xl font-black text-brand-white mb-3">{s.heading}</h2>
              <p className="text-brand-muted text-base leading-relaxed">{s.body}</p>
            </div>
            <div className="bg-brand-green/20 border-2 border-brand-green rounded-2xl px-8 py-4">
              <p className="text-brand-green font-black text-2xl">+{s.xpReward ?? lesson.xpReward} XP</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canAdvance =
    slide.type === 'tap-reveal' ? tapped :
    slide.type === 'quiz' ? revealed :
    true

  return (
    <div className="max-w-sm mx-auto px-6 py-6 flex flex-col min-h-screen">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(backHref)}
          className="text-brand-muted text-sm active:scale-95"
        >
          ✕
        </button>
        <div className="flex-1 bg-white/10 rounded-full h-3">
          <div
            className="bg-brand-green h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-brand-muted text-xs w-10 text-right">
          {slideIndex + 1}/{lesson.slides.length}
        </span>
      </div>

      {/* Slide */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {renderSlide(slide)}
      </div>

      {/* Continue button */}
      {slide.type !== 'tap-reveal' || tapped ? (
        <button
          onClick={nextSlide}
          disabled={!canAdvance}
          className={`w-full font-black text-xl py-5 rounded-2xl transition-all active:scale-95 ${
            canAdvance
              ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/30'
              : 'bg-brand-surface text-brand-muted border border-white/10 opacity-50'
          }`}
        >
          {slide.type === 'complete' ? 'Back to Track →' : 'Continue →'}
        </button>
      ) : null}

    </div>
  )
}
