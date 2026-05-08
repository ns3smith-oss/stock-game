'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'

const QUESTIONS = [
  {
    question: 'When someone mentions the stock market, how do you honestly feel?',
    options: [
      'Completely lost — it feels like another language 😅',
      'Curious, but I have no idea where to start 🤔',
      'I understand a little, but not enough 📖',
      'Pretty comfortable — I follow it sometimes 📈',
    ],
  },
  {
    question: 'Have you ever bought a stock or made an investment?',
    options: [
      'Never — I would not know how to begin',
      'I have an account but have not made any moves yet',
      'I have invested a small amount before',
      'Yes, I invest regularly',
    ],
  },
  {
    question: 'How would you describe your current relationship with saving money?',
    options: [
      'I spend most of what I earn',
      'I save occasionally when I can',
      'I save consistently but want to do more with it',
      'I save regularly and I am ready to invest',
    ],
  },
  {
    question: 'How do you learn best?',
    options: [
      'Show me real examples 👀',
      'Let me practice it hands-on 🎮',
      'Walk me through it step by step 📋',
      'Give me the big picture first, then the details 🗺️',
    ],
  },
  {
    question: 'How much time can you dedicate to Stockly each day?',
    options: [
      '5 minutes — short and consistent ⚡',
      '10 minutes — steady pace 🔥',
      '15 minutes — committed 💪',
      '20 or more minutes — all in 🚀',
    ],
  },
]

export default function QuestionsPage() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  const question = QUESTIONS[index]
  const isLast = index === QUESTIONS.length - 1

  function handleSelect(optionIndex: number) {
    if (selected !== null) return
    haptics.tap()
    setSelected(optionIndex)

    setTimeout(() => {
      const newAnswers = [...answers, question.options[optionIndex]]
      setAnswers(newAnswers)

      if (isLast) {
        localStorage.setItem('stockly_quick_answers', JSON.stringify(newAnswers))
        router.push('/onboarding/goal')
      } else {
        setIndex(index + 1)
        setSelected(null)
      }
    }, 400)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex-1 bg-white/10 rounded-full h-2">
          <div
            className="bg-brand-purple h-2 rounded-full transition-all duration-500"
            style={{ width: `${(index / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-brand-muted text-xs">{index + 1}/{QUESTIONS.length}</span>
      </div>

      {/* Mascot */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-brand-surface border-2 border-brand-purple flex items-center justify-center shadow-lg shadow-brand-purple/30">
          <span className="text-4xl">🐂</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl font-black text-brand-white text-center mb-8 leading-snug animate-slideIn">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 ${
                selected === i
                  ? 'border-brand-green bg-brand-green text-brand-black scale-95'
                  : selected !== null
                  ? 'border-white/10 bg-brand-surface text-brand-muted opacity-40'
                  : 'border-white/20 bg-brand-surface text-brand-white active:scale-95 active:border-brand-purple'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
