'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Track = 'starter' | 'builder' | 'leveler'

const QUESTIONS = [
  {
    id: 'q1',
    question: 'When someone brings up the stock market, what\'s your honest first reaction?',
    options: [
      { label: 'My eyes glaze over — it feels like another language', points: 0 },
      { label: 'I\'m curious but I don\'t really know where to begin', points: 1 },
      { label: 'I get the general idea but the details lose me', points: 2 },
      { label: 'I actually follow it somewhat — I just want to get better', points: 3 },
    ],
  },
  {
    id: 'q2',
    question: 'Have you ever bought a stock, ETF, or anything like that?',
    options: [
      { label: "No, and I wouldn't even know how to start", points: 0 },
      { label: "I have an app (like Robinhood or Webull) but haven't actually bought anything", points: 1 },
      { label: "I've bought something before, even if I wasn't totally sure what I was doing", points: 3 },
    ],
  },
  {
    id: 'q3',
    question: 'What is a stock, in your own words? Pick the one that feels closest.',
    options: [
      { label: "Honestly, I'm not sure", points: 0 },
      { label: "It's like… owning a tiny piece of a company?", points: 1 },
      { label: "It's a share of ownership in a company that can go up or down in value", points: 3 },
    ],
  },
  {
    id: 'q4',
    question: "You hear someone say a stock 'dropped 10% today.' How do you feel reading that?",
    options: [
      { label: "I don't know what that means for the person who owns it", points: 0 },
      { label: "I know it went down but I'm not sure if that's a big deal or not", points: 1 },
      { label: "I know that's significant and I'd want to know why before reacting", points: 3 },
    ],
  },
  {
    id: 'q5',
    question: "What's a bull market?",
    options: [
      { label: 'No idea', points: 0 },
      { label: 'Something good… prices going up?', points: 1 },
      { label: 'A period where stock prices are rising and investor confidence is high', points: 3 },
    ],
  },
  {
    id: 'q6',
    question: "Someone tells you to 'do your research before buying a stock.' What does that actually mean to you?",
    options: [
      { label: "I wouldn't know where to even look", points: 0 },
      { label: "I'd probably Google the company name and see what comes up", points: 1 },
      { label: "I'd look at their earnings, news, chart history, and maybe their competitors", points: 3 },
    ],
  },
  {
    id: 'q7',
    question: "What's your biggest fear when it comes to investing?",
    note: 'This one is just for us — no right or wrong answer.',
    options: [
      { label: "Losing money I can't afford to lose", points: 0 },
      { label: "Not understanding what I'm doing", points: 0 },
      { label: "Being taken advantage of or scammed", points: 0 },
      { label: "Missing out while everyone else builds wealth", points: 0 },
    ],
  },
  {
    id: 'q8',
    question: "What do you actually want to get out of Stockly?",
    options: [
      { label: "I want to understand what stocks even are, from the very beginning", points: 0 },
      { label: "I want to feel confident enough to make my first investment", points: 1 },
      { label: "I want real strategies so I can start building actual wealth", points: 3 },
    ],
  },
]

function getTrack(score: number): Track {
  if (score <= 4) return 'starter'
  if (score <= 10) return 'builder'
  return 'leveler'
}

const TRACK_RESULTS: Record<Track, { emoji: string; title: string; description: string }> = {
  starter: {
    emoji: '🌱',
    title: "You're Brand New — and that's perfect.",
    description: "Everyone starts somewhere. Stockly will walk you through everything from the very beginning, in plain language, with zero judgment. By the end, you'll understand things most people never learned.",
  },
  builder: {
    emoji: '🔨',
    title: "You're Curious & Learning.",
    description: "You've got some foundation — now let's fill in the gaps. Your track focuses on understanding how to actually make a move with confidence, without second-guessing yourself.",
  },
  leveler: {
    emoji: '🚀',
    title: "You're Ready to Level Up.",
    description: "You know the basics. Now it's time to get strategic — chart reading, risk management, building a real plan. Your track skips the basics and gets into what actually matters.",
  },
}

export default function PlacementPage() {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [track, setTrack] = useState<Track>('starter')
  const router = useRouter()

  const question = QUESTIONS[index]
  const isLast = index === QUESTIONS.length - 1

  function handleSelect(points: number, optionIndex: number) {
    setSelected(optionIndex)
    setTimeout(() => {
      const newScore = score + points
      if (isLast) {
        const result = getTrack(newScore)
        setTrack(result)
        setDone(true)
      } else {
        setScore(newScore)
        setIndex(index + 1)
        setSelected(null)
      }
    }, 400)
  }

  if (done) {
    const result = TRACK_RESULTS[track]
    return (
      <div className="max-w-sm mx-auto px-6 py-10 flex flex-col items-center text-center min-h-screen">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-7xl mb-6">{result.emoji}</div>
          <h2 className="text-2xl font-black text-brand-navy mb-4 leading-tight">{result.title}</h2>
          <p className="text-brand-navy-muted text-base leading-relaxed mb-8">{result.description}</p>
          <div className="bg-brand-purple-light rounded-2xl px-6 py-3 text-brand-purple font-bold text-sm">
            Your track: {track.charAt(0).toUpperCase() + track.slice(1)}
          </div>
        </div>
        <button
          onClick={() => router.push(`/learn/${track}`)}
          className="w-full bg-brand-purple text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform mt-8"
        >
          Start my lessons →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-10 flex flex-col min-h-screen">

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex-1 bg-brand-navy/10 rounded-full h-2">
          <div
            className="bg-brand-cyan h-2 rounded-full transition-all duration-300"
            style={{ width: `${(index / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <span className="text-brand-navy-muted text-xs">{index + 1} / {QUESTIONS.length}</span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        {question.note && (
          <p className="text-brand-purple text-xs font-bold mb-3 text-center uppercase tracking-wide">
            {question.note}
          </p>
        )}
        <h2 className="text-xl font-black text-brand-navy mb-8 leading-snug text-center">
          {question.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selected === null && handleSelect(option.points, i)}
              className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-medium text-sm transition-all duration-200 ${
                selected === i
                  ? 'border-brand-purple bg-brand-purple text-white'
                  : selected !== null
                  ? 'border-brand-navy/10 bg-white text-brand-navy-muted opacity-50'
                  : 'border-brand-navy/10 bg-white text-brand-navy active:scale-95'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
