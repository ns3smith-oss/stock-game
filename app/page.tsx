'use client'

import { useGameState } from '@/hooks/useGameState'
import { ModuleCard, type ModuleStatus } from '@/components/ModuleCard'

export default function HomePage() {
  const { state, hydrated, resetGame } = useGameState()

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    )
  }

  const lessonStatus: ModuleStatus = state.lessonProgress.completed ? 'complete' : 'available'
  const simulatorStatus: ModuleStatus = state.lessonProgress.completed
    ? state.portfolioState.hasCompletedFirstTrade
      ? 'complete'
      : 'available'
    : 'locked'
  const challengeStatus: ModuleStatus = state.portfolioState.hasCompletedFirstTrade
    ? state.challengeProgress.completed
      ? 'complete'
      : 'available'
    : 'locked'

  const allDone =
    state.lessonProgress.completed &&
    state.portfolioState.hasCompletedFirstTrade &&
    state.challengeProgress.completed

  return (
    <div className="max-w-sm mx-auto px-4 py-6">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-2">📈</div>
        <h1 className="text-3xl font-black text-white">StockQuest</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Learn to invest like a pro — one quest at a time
        </p>
      </div>

      {/* Completion banner */}
      {allDone && (
        <div className="bg-gradient-to-r from-gold to-yellow-500 rounded-3xl p-4 mb-6 text-center text-navy font-bold">
          🎉 You completed all quests! More levels coming soon.
        </div>
      )}

      {/* Module cards */}
      <div className="flex flex-col gap-4">
        <ModuleCard
          title="What is a Stock?"
          description="Learn the basics with fun analogies — no boring textbooks"
          icon="📚"
          xpReward={50}
          status={lessonStatus}
          href="/lesson"
          accentColor="border-yellow-400"
        />
        <ModuleCard
          title="Trading Simulator"
          description="Buy and sell stocks with $1,000 of fake money — no risk!"
          icon="💹"
          xpReward={10}
          status={simulatorStatus}
          href="/simulator"
          accentColor="border-blue-400"
        />
        <ModuleCard
          title="Scenario Challenge"
          description="Can you make the right call when the market gets wild?"
          icon="🎯"
          xpReward={30}
          status={challengeStatus}
          href="/challenge"
          accentColor="border-purple-400"
        />
      </div>

      {/* Dev reset (hidden in real build, but helpful during development) */}
      <button
        onClick={resetGame}
        className="mt-10 text-xs text-gray-700 underline block mx-auto"
      >
        Reset progress (dev only)
      </button>
    </div>
  )
}
