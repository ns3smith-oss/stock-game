'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { StocklyLogo } from '@/components/StocklyLogo'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [splashOut, setSplashOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const out = setTimeout(() => setSplashOut(true), 2200)
    const hide = setTimeout(() => setLoading(false), 2700)
    return () => { clearTimeout(out); clearTimeout(hide) }
  }, [])

  function handleStart() {
    haptics.tap()
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-brand-black flex flex-col items-center justify-center gap-6 z-50 transition-opacity duration-500 ${splashOut ? 'opacity-0' : 'opacity-100'}`}>
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand-purple opacity-20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo + wordmark */}
        <div className="flex flex-col items-center gap-4 animate-logoReveal">

          {/* Inline wordmark on splash */}
          <div className="flex items-center -space-x-2">
            <StocklyLogo size={72} />
            <span className="text-6xl font-black text-brand-white tracking-tight leading-none">tockly</span>
          </div>

          <p className="text-brand-green font-semibold text-sm tracking-wide">
            Learning stocks, simplified.
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2 mt-2">
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
    <div className="max-w-sm mx-auto px-6 flex flex-col items-center justify-between min-h-screen py-16">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand-purple opacity-20 rounded-full blur-3xl pointer-events-none" />

      <div />

      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-8 animate-fadein">

        {/* Logo mark — standing, grounded */}
        <div className="flex flex-col items-center">
          <StocklyLogo size={140} />
          <div className="w-28 h-3 bg-brand-purple/20 rounded-full blur-sm mt-1" />
        </div>

        {/* Wordmark: S logo inline with tockly */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center -space-x-2">
            <StocklyLogo size={56} />
            <span className="text-5xl font-black text-brand-white tracking-tight leading-none">tockly</span>
          </div>
          <p className="text-brand-green font-bold text-base mt-1">
            Learning stocks, simplified.
          </p>
        </div>

        {/* Badges */}
        <div className="flex gap-3">
          {['📈 Stocks', '⚡ Options', '🚀 Futures'].map((tag) => (
            <span
              key={tag}
              className="bg-brand-surface text-brand-muted text-xs font-semibold px-3 py-2 rounded-full border border-white/10"
            >
              {tag}
            </span>
          ))}
        </div>

      </div>

      {/* CTA */}
      <div className="w-full flex flex-col gap-4 animate-fadein">
        <button
          onClick={handleStart}
          className="w-full bg-brand-green text-brand-black font-black text-xl py-5 rounded-2xl shadow-lg shadow-brand-green/30 active:scale-95 transition-transform"
        >
          Get Started →
        </button>
        <p className="text-brand-muted text-xs text-center">
          Free to start · No experience needed
        </p>
      </div>

    </div>
  )
}
