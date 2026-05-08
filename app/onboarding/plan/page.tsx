'use client'

import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

export default function PlanPage() {
  const router = useRouter()

  function handleSelect(plan: 'free' | 'pro') {
    haptics.tap()
    localStorage.setItem('stockly_plan', plan)
    router.push('/onboarding/start-choice')
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      <div className="text-center mb-8 animate-slideUp">
        <h1 className="text-2xl font-black text-brand-white mb-2">Choose your plan</h1>
        <p className="text-brand-muted text-sm">Start free. Upgrade anytime.</p>
      </div>

      <div className="flex flex-col gap-4 flex-1">

        {/* Free */}
        <button
          onClick={() => handleSelect('free')}
          className="flex flex-col p-6 rounded-3xl border-2 border-white/20 bg-brand-surface text-left active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-brand-white font-black text-xl">Free</span>
            <span className="text-brand-green font-black text-xl">$0</span>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              'Beginner stock crash course',
              'Human language glossary',
              'Basic concepts with visuals',
              '1–2 mock trading scenarios',
              'Daily stock fact',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-brand-muted text-sm">
                <span className="text-brand-green flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </button>

        {/* Pro */}
        <button
          onClick={() => handleSelect('pro')}
          className="flex flex-col p-6 rounded-3xl border-2 border-brand-purple bg-brand-purple/10 text-left active:scale-95 transition-all relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-brand-purple text-brand-white text-xs font-black px-3 py-1 rounded-full">
            BEST VALUE
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-brand-white font-black text-xl">Pro</span>
            <span className="text-brand-purple font-black text-xl">$5.99/mo</span>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              'Everything in Free',
              'Advanced lessons & strategies',
              'Full mock trading simulator',
              'Weekly CryptoChic Insights newsletter',
              'Personalized learning path',
              'Goal tracker & risk calculator',
              'Portfolio setup guide',
              '"What if" tool',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-brand-muted text-sm">
                <span className="text-brand-purple flex-shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </button>

      </div>

      <p className="text-brand-muted text-xs text-center mt-4">
        Cancel anytime · No hidden fees
      </p>

    </div>
  )
}
