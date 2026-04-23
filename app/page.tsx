'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="max-w-sm mx-auto px-6 flex flex-col items-center justify-between min-h-screen py-12">

      {/* Top spacer */}
      <div />

      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-6">

        {/* Animated logo mark */}
        <div className="relative flex items-center justify-center w-28 h-28 rounded-3xl bg-brand-yellow shadow-2xl animate-levelBurst">
          <span className="text-6xl">📈</span>
        </div>

        {/* Wordmark */}
        <div>
          <h1 className="text-5xl font-black text-white tracking-tight">Stockly</h1>
          <p className="text-brand-yellow font-bold text-base mt-1">Learning stocks, simplified.</p>
        </div>

        {/* Mascot placeholder */}
        <div className="w-24 h-24 rounded-full bg-brand-purple-light border-2 border-dashed border-brand-yellow/40 flex items-center justify-center mt-2">
          <span className="text-brand-lavender text-xs text-center leading-tight px-2">mascot<br/>coming soon</span>
        </div>

      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={() => router.push('/disclaimer')}
          className="w-full bg-brand-yellow text-brand-purple font-black text-xl py-5 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Get started →
        </button>
        <p className="text-brand-lavender text-xs text-center">Free to start · No experience needed</p>
      </div>

    </div>
  )
}
