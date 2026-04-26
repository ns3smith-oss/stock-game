'use client'

import { useRouter } from 'next/navigation'

export default function DisclaimerPage() {
  const router = useRouter()

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🤝</div>
        <h1 className="text-2xl font-black text-brand-navy mb-2">Before we begin</h1>
        <p className="text-brand-navy-muted text-sm">
          We want to be upfront with you — because that's the kind of platform Stockly is.
        </p>
      </div>

      {/* Disclaimer card */}
      <div className="bg-white rounded-3xl p-6 mb-6 flex flex-col gap-5 shadow-sm border border-brand-purple/10">

        <div className="flex gap-4">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-brand-navy font-bold text-sm mb-1">This is education, not advice</p>
            <p className="text-brand-navy-muted text-sm leading-relaxed">
              Everything in Stockly is here to help you understand how stocks work. We are not financial advisors and nothing here is financial advice.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-brand-navy/10" />

        <div className="flex gap-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-brand-navy font-bold text-sm mb-1">Trading involves real risk</p>
            <p className="text-brand-navy-muted text-sm leading-relaxed">
              When you trade real stocks, you can lose money — including money you put in. Learning how it works is the first step to protecting yourself.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-brand-navy/10" />

        <div className="flex gap-4">
          <span className="text-2xl">💛</span>
          <div>
            <p className="text-brand-navy font-bold text-sm mb-1">We're in your corner</p>
            <p className="text-brand-navy-muted text-sm leading-relaxed">
              Stockly is here to give you the knowledge that was never handed to you. What you do with it is always your choice.
            </p>
          </div>
        </div>

      </div>

      {/* Acknowledge button */}
      <button
        onClick={() => router.push('/onboarding')}
        className="w-full bg-brand-purple text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mt-auto"
      >
        I understand — let's go 💛
      </button>

    </div>
  )
}
