'use client'

import Link from 'next/link'
import { useGameState } from '@/hooks/useGameState'
import { TradingSimulator } from '@/components/TradingSimulator'

export default function SimulatorPage() {
  const { state, hydrated } = useGameState()

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading...</div>
      </div>
    )
  }

  // Soft gate — redirect UI back to home if lesson not complete
  if (!state.lessonProgress.completed) {
    return (
      <div className="max-w-sm mx-auto px-4 py-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-white text-2xl font-black mb-2">Complete the Lesson First!</h2>
        <p className="text-gray-400 mb-6">You need to finish the lesson to unlock the simulator.</p>
        <Link
          href="/lesson"
          className="inline-block bg-brand-blue text-white font-bold px-6 py-3 rounded-2xl"
        >
          Go to Lesson →
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <Link href="/" className="text-gray-400 text-sm hover:text-gray-300 transition-colors">
          ←
        </Link>
        <h1 className="text-white font-black text-xl">Trading Simulator</h1>
        <span className="text-gray-500 text-xs ml-auto">Fake money only 😄</span>
      </div>

      <TradingSimulator />
    </div>
  )
}
