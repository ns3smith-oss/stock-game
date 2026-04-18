'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGameState } from '@/hooks/useGameState'
import { ScenarioChallenge } from '@/components/ScenarioChallenge'
import { SCENARIOS } from '@/lib/constants'
import { XPPopup } from '@/components/XPPopup'
import { useState } from 'react'

export default function ChallengePage() {
  const router = useRouter()
  const { state, hydrated, addXP, completeChallenge } = useGameState()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [showXP, setShowXP] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    )
  }

  if (!state.portfolioState.hasCompletedFirstTrade) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-white text-2xl font-black mb-2">Trade First!</h2>
        <p className="text-gray-400 mb-6">Make at least one trade in the simulator to unlock this challenge.</p>
        <Link href="/simulator" className="inline-block bg-brand-blue text-white font-bold px-6 py-3 rounded-2xl">
          Go to Simulator →
        </Link>
      </div>
    )
  }

  const handleComplete = (wasCorrect: boolean) => {
    const scenario = SCENARIOS[currentIndex]
    const xp = wasCorrect ? scenario.xpReward : 10
    addXP(xp)
    completeChallenge(scenario.id, wasCorrect)
    if (wasCorrect) setCorrectCount(c => c + 1)
    setShowXP(xp)

    setTimeout(() => {
      setShowXP(null)
      if (currentIndex < SCENARIOS.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        setFinished(true)
      }
    }, 1500)
  }

  if (finished) {
    const total = SCENARIOS.length
    const pct = Math.round((correctCount / total) * 100)
    const medal = pct === 100 ? '🥇' : pct >= 60 ? '🥈' : '🥉'

    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-navy flex flex-col items-center justify-center px-4 text-center">
        <div className="text-7xl mb-4">{medal}</div>
        <h2 className="text-white text-3xl font-black mb-2">Challenge Complete!</h2>
        <p className="text-gray-300 text-lg mb-1">
          You got <span className="text-gold font-black">{correctCount}</span> out of{' '}
          <span className="text-gold font-black">{total}</span> correct
        </p>
        <p className="text-gray-400 text-sm mb-8">{pct}% accuracy</p>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-blue text-white font-bold px-8 py-4 rounded-2xl text-lg"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-navy pb-8">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link href="/" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">←</Link>
        <h1 className="text-white font-black text-xl">Scenario Challenge</h1>
        <span className="ml-auto text-gray-400 text-sm">
          {currentIndex + 1} / {SCENARIOS.length}
        </span>
      </div>

      <ScenarioChallenge
        key={currentIndex}
        scenario={SCENARIOS[currentIndex]}
        onComplete={handleComplete}
      />

      {showXP !== null && (
        <XPPopup amount={showXP} onComplete={() => setShowXP(null)} />
      )}
    </div>
  )
}
