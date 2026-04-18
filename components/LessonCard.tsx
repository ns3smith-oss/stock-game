'use client'

import { useState } from 'react'
import type { LessonSlide } from '@/types'
import { Button } from './ui/Button'

interface LessonCardProps {
  slide: LessonSlide
  isFirst: boolean
  isLast: boolean
  onNext: (earnedXP?: number) => void
  onBack: () => void
}

export function LessonCard({ slide, isFirst, isLast, onNext, onBack }: LessonCardProps) {
  const [tapped, setTapped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleQuizSubmit = () => {
    if (selectedAnswer === null) return
    setSubmitted(true)
  }

  const handleNext = () => {
    const xpEarned =
      slide.type === 'quiz' && submitted && selectedAnswer === slide.quiz?.correctIndex
        ? slide.quiz.xpReward
        : 0
    onNext(xpEarned)
    // Reset local state for next card
    setTapped(false)
    setSelectedAnswer(null)
    setSubmitted(false)
  }

  const isCorrect = submitted && selectedAnswer === slide.quiz?.correctIndex
  const isWrong = submitted && selectedAnswer !== slide.quiz?.correctIndex

  const canProceed =
    slide.type !== 'quiz' || (submitted && isCorrect)

  return (
    <div className="flex flex-col items-center text-center px-2 py-4 min-h-[340px]">
      {/* Main emoji */}
      {slide.emoji && (
        <div className="text-7xl mb-5 select-none">{slide.emoji}</div>
      )}

      {/* Heading */}
      <h2 className="text-2xl font-black text-navy mb-3 leading-tight">{slide.heading}</h2>

      {/* Body — quiz type shows different content */}
      {slide.type !== 'quiz' && slide.type !== 'interactive-tap' && (
        <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">{slide.body}</p>
      )}

      {/* Interactive tap */}
      {slide.type === 'interactive-tap' && (
        <div className="w-full">
          <p className="text-gray-600 text-lg mb-4">{slide.body}</p>
          {!tapped ? (
            <button
              onClick={() => setTapped(true)}
              className="w-full py-5 rounded-2xl border-4 border-dashed border-brand-blue text-brand-blue font-bold text-lg hover:bg-indigo-50 active:scale-95 transition-all"
            >
              {slide.tapReveal?.prompt ?? 'Tap to reveal!'}
            </button>
          ) : (
            <div className="bg-indigo-50 border-2 border-brand-blue rounded-2xl p-4 text-left animate-slideUp">
              <p className="text-navy text-base leading-relaxed font-medium">
                {slide.tapReveal?.hiddenText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quiz */}
      {slide.type === 'quiz' && slide.quiz && (
        <div className="w-full">
          <p className="text-gray-700 text-base font-semibold mb-4 text-left">
            {slide.quiz.question}
          </p>
          <div className="flex flex-col gap-3 mb-4">
            {slide.quiz.options.map((option, idx) => {
              let optionStyle = 'border-gray-200 bg-white text-navy'
              if (submitted) {
                if (idx === slide.quiz!.correctIndex) {
                  optionStyle = 'border-success bg-green-50 text-success'
                } else if (idx === selectedAnswer) {
                  optionStyle = 'border-danger bg-red-50 text-danger'
                } else {
                  optionStyle = 'border-gray-100 bg-gray-50 text-gray-400'
                }
              } else if (idx === selectedAnswer) {
                optionStyle = 'border-brand-blue bg-indigo-50 text-brand-blue'
              }

              return (
                <button
                  key={idx}
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(idx)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 disabled:cursor-default ${optionStyle}`}
                >
                  {option}
                </button>
              )
            })}
          </div>

          {!submitted && (
            <Button
              variant="primary"
              size="lg"
              disabled={selectedAnswer === null}
              onClick={handleQuizSubmit}
            >
              Check Answer
            </Button>
          )}

          {submitted && (
            <div className={`rounded-2xl p-4 mt-1 animate-slideUp text-left ${isCorrect ? 'bg-green-50 border border-success' : 'bg-red-50 border border-danger'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                {isCorrect ? '✅ Correct!' : '❌ Not quite!'}
              </p>
              <p className="text-sm text-gray-700">{slide.quiz!.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6 w-full">
        {!isFirst && (
          <Button variant="secondary" size="md" onClick={onBack} className="flex-shrink-0">
            ← Back
          </Button>
        )}
        {canProceed && (
          <Button variant="primary" size="lg" onClick={handleNext} className="flex-1">
            {isLast ? '🎉 Finish Lesson!' : 'Next →'}
          </Button>
        )}
      </div>
    </div>
  )
}
