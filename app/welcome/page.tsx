'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

export default function WelcomePage() {
  const [checked, setChecked] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const router = useRouter()

  function handleCheck() {
    haptics.tap()
    setChecked(!checked)
    setAttempted(false)
  }

  function handleContinue() {
    if (!checked) {
      haptics.wrong()
      setAttempted(true)
      return
    }
    // Store agreement with timestamp
    localStorage.setItem('stockly_terms_agreed', JSON.stringify({
      agreed: true,
      timestamp: new Date().toISOString(),
      sessionId: crypto.randomUUID(),
    }))
    haptics.success()
    router.push('/onboarding/questions')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Header */}
      <div className="text-center mb-8 animate-slideUp">
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-3xl font-black text-brand-white mb-2">
          Welcome to <span className="text-brand-green">Stockly</span>
        </h1>
        <p className="text-brand-muted text-sm leading-relaxed">
          The place where learning stocks finally makes sense — no judgment, no jargon, just you leveling up.
        </p>
      </div>

      {/* Terms card */}
      <div className="bg-brand-surface rounded-3xl p-6 mb-6 flex flex-col gap-5 border border-white/10 animate-slideUp">
        <div className="flex gap-4">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-brand-white font-bold text-sm mb-1">Education only — not financial advice</p>
            <p className="text-brand-muted text-sm leading-relaxed">
              Everything here teaches you how stocks work. We are not financial advisors. Nothing on Stockly is financial advice.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-white/10" />

        <div className="flex gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-brand-white font-bold text-sm mb-1">Trading involves real risk</p>
            <p className="text-brand-muted text-sm leading-relaxed">
              Real money can be lost when trading stocks. Learning how it works is the first step to protecting yourself.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-white/10" />

        <div className="flex gap-4">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="text-brand-white font-bold text-sm mb-1">Your safe space</p>
            <p className="text-brand-muted text-sm leading-relaxed">
              Stockly is a judgment-free zone. No dumb questions. No gatekeeping. Just learning at your pace.
            </p>
          </div>
        </div>
      </div>

      {/* Checkbox */}
      <button
        onClick={handleCheck}
        className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all mb-4 ${
          checked
            ? 'border-brand-green bg-brand-green/10'
            : attempted
            ? 'border-brand-error bg-brand-error/10 animate-shake'
            : 'border-white/20 bg-brand-surface'
        }`}
      >
        <div className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          checked ? 'bg-brand-green border-brand-green' : 'border-white/40'
        }`}>
          {checked && <span className="text-brand-black text-sm font-black">✓</span>}
        </div>
        <p className="text-brand-white text-sm leading-relaxed text-left">
          I understand that Stockly is for educational purposes only and does not provide financial advice. I agree to the terms of use.
        </p>
      </button>

      {attempted && !checked && (
        <p className="text-brand-error text-xs text-center mb-4 animate-slideUp">
          Please check the box above to continue
        </p>
      )}

      {/* Continue */}
      <button
        onClick={handleContinue}
        className={`w-full font-black text-xl py-5 rounded-2xl transition-all active:scale-95 mt-auto ${
          checked
            ? 'bg-brand-green text-brand-black shadow-lg shadow-brand-green/30'
            : 'bg-brand-surface text-brand-muted border border-white/10'
        }`}
      >
        {checked ? "Let's go 🚀" : 'Check the box to continue'}
      </button>

    </div>
  )
}
