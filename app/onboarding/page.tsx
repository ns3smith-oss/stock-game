'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SLIDES = [
  {
    emoji: '🤔',
    title: 'Why do most people never build wealth?',
    body: "It's not because they're lazy. It's not because they're bad with money. It's because nobody ever taught them. The rules of money were passed down in some families and completely skipped in others. That ends here.",
  },
  {
    emoji: '🧠',
    title: 'Rich vs. poor — it starts in the mind',
    body: "Wealthy people don't just have more money — they think about money differently. They ask \"how can I make this money work for me?\" instead of \"how do I survive until next payday?\" That mindset shift is the first thing we're going to build.",
  },
  {
    emoji: '👟',
    title: 'Consumer vs. Builder',
    body: "A consumer spends money on things that lose value — shoes, phones, cars. A builder spends money on things that grow in value — stocks, businesses, real estate. You can still enjoy life and be a builder. It's about balance, not sacrifice.",
  },
  {
    emoji: '💰',
    title: 'Pay yourself first',
    body: "Most people pay their bills, buy what they want, and save whatever's left. Wealthy people flip that. They set aside money for investing first — before spending on anything else. Even $10 a week adds up to something real.",
  },
]

export default function OnboardingPage() {
  const [index, setIndex] = useState(0)
  const router = useRouter()

  const slide = SLIDES[index]
  const isLast = index === SLIDES.length - 1

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index
                ? 'w-6 bg-brand-yellow'
                : i < index
                ? 'w-2 bg-brand-yellow/50'
                : 'w-2 bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="text-7xl mb-6">{slide.emoji}</div>
          <h2 className="text-2xl font-black text-white mb-4 leading-tight">{slide.title}</h2>
          <p className="text-brand-lavender text-base leading-relaxed">{slide.body}</p>
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={() => isLast ? router.push('/placement') : setIndex(index + 1)}
        className="w-full bg-brand-yellow text-brand-purple font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        {isLast ? "I'm ready — let's find my level →" : 'Next →'}
      </button>

      {index > 0 && (
        <button
          onClick={() => setIndex(index - 1)}
          className="text-brand-lavender text-sm mt-4 text-center w-full"
        >
          ← Back
        </button>
      )}

    </div>
  )
}
