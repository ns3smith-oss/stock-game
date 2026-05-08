'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { haptics } from '@/lib/haptics'
import { celebrateCorrect } from '@/lib/celebrate'

const QUESTIONS = [
  {
    question: 'What is a stock?',
    options: [
      'A type of bond issued by the government',
      'A small piece of ownership in a company',
      'A savings account with interest',
      'A loan you give to a business',
    ],
    correct: 1,
  },
  {
    question: "When the market is 'bearish,' what does that mean?",
    options: [
      'Prices are rising',
      'Trading is closed for the day',
      'Prices are falling',
      'A new company went public',
    ],
    correct: 2,
  },
  {
    question: 'What does diversification mean in investing?',
    options: [
      'Putting all your money in one strong stock',
      'Spreading investments across different assets to reduce risk',
      'Selling stocks when the market drops',
      'Only buying tech stocks',
    ],
    correct: 1,
  },
  {
    question: "What is a 'dividend'?",
    options: [
      'A fee charged by your broker',
      'A penalty for selling early',
      'A portion of company profits paid to shareholders',
      'The price difference when buying and selling',
    ],
    correct: 2,
  },
  {
    question: 'What does P/E ratio stand for?',
    options: [
      'Profit and Earnings',
      'Price to Earnings',
      'Percentage of Equity',
      'Public Exchange',
    ],
    correct: 1,
  },
]

export default function KnowledgeCheckPage() {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [shakeIndex, setShakeIndex] = useState<number | null>(null)
  const router = useRouter()

  const question = QUESTIONS[index]
  const isLast = index === QUESTIONS.length - 1

  function handleSelect(i: number) {
    if (revealed) return
    haptics.tap()
    setSelected(i)
    setRevealed(true)

    const isCorrect = i === question.correct
    if (isCorrect) {
      haptics.correct()
      celebrateCorrect()
    } else {
      haptics.wrong()
      setShakeIndex(i)
      setTimeout(() => setShakeIndex(null), 500)
    }

    const newScore = isCorrect ? score + 1 : score

    setTimeout(() => {
      if (isLast) {
        localStorage.setItem('stockly_knowledge_score', String(newScore))
        router.push('/onboarding/course-ready')
      } else {
        setIndex(index + 1)
        setScore(newScore)
        setSelected(null)
        setRevealed(false)
      }
    }, 1000)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 bg-white/10 rounded-full h-2">
          <div
            className="bg-brand-purple h-2 rounded-full transition-all duration-500"
            style={{ width: `${(index / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-brand-muted text-xs">{index + 1}/{QUESTIONS.length}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-xl font-black text-brand-white text-center mb-8 leading-snug animate-slideIn">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => {
            const isCorrect = i === question.correct
            const isSelected = selected === i

            let style = 'border-white/20 bg-brand-surface text-brand-white'
            if (revealed) {
              if (isCorrect) style = 'border-brand-green bg-brand-green/20 text-brand-white'
              else if (isSelected) style = 'border-brand-error bg-brand-error/20 text-brand-white'
              else style = 'border-white/10 bg-brand-surface text-brand-muted opacity-40'
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-semibold text-sm transition-all ${style} ${
                  shakeIndex === i ? 'animate-shake' : ''
                } ${!revealed ? 'active:scale-95' : ''}`}
              >
                <span className="flex items-center gap-3">
                  {revealed && isCorrect && <span>✅</span>}
                  {revealed && isSelected && !isCorrect && <span>❌</span>}
                  {option}
                </span>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}
