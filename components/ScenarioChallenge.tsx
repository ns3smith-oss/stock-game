'use client'

import { useState } from 'react'
import type { Scenario } from '@/types'
import { Button } from './ui/Button'

interface ScenarioChallengeProps {
  scenario: Scenario
  onComplete: (wasCorrect: boolean) => void
}

export function ScenarioChallenge({ scenario, onComplete }: ScenarioChallengeProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const isCorrect = selected === scenario.correctIndex

  const handleAnswer = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
  }

  return (
    <div className="w-full max-w-sm mx-auto px-4 py-6">
      {/* Scenario card */}
      <div className="bg-white/10 rounded-3xl p-5 mb-5">
        <div className="text-5xl mb-3 text-center">{scenario.emoji}</div>
        <p className="text-white font-bold text-lg text-center leading-snug mb-2">
          {scenario.prompt}
        </p>
        <p className="text-gray-300 text-sm text-center">{scenario.context}</p>
      </div>

      {/* Answer buttons */}
      <div className="flex flex-col gap-3 mb-5">
        {scenario.options.map((option, idx) => {
          let style = 'border-white/30 bg-white/10 text-white'
          if (answered) {
            if (idx === scenario.correctIndex) {
              style = 'border-success bg-green-900/40 text-success'
            } else if (idx === selected) {
              style = 'border-danger bg-red-900/40 text-danger'
            } else {
              style = 'border-white/10 bg-white/5 text-gray-600'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={answered}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95 disabled:cursor-default ${style}`}
            >
              {idx === scenario.correctIndex && answered && '✅ '}
              {idx === selected && idx !== scenario.correctIndex && answered && '❌ '}
              {option}
            </button>
          )
        })}
      </div>

      {/* Feedback panel */}
      {answered && (
        <div className={`rounded-2xl p-5 mb-5 animate-slideUp ${isCorrect ? 'bg-green-900/40 border border-success' : 'bg-orange-900/40 border border-orange-400'}`}>
          <p className={`font-black text-lg mb-2 ${isCorrect ? 'text-success' : 'text-orange-400'}`}>
            {isCorrect ? '🎉 Great thinking!' : '💡 Here\'s the lesson:'}
          </p>
          <p className="text-gray-200 text-sm leading-relaxed">{scenario.explanation}</p>
          {isCorrect && (
            <p className="text-gold font-bold mt-2 text-sm">+{scenario.xpReward} XP earned!</p>
          )}
        </div>
      )}

      {/* Continue button */}
      {answered && (
        <Button
          variant="primary"
          size="lg"
          onClick={() => onComplete(isCorrect)}
        >
          Continue →
        </Button>
      )}
    </div>
  )
}
