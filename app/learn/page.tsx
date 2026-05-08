'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { HamburgerMenu } from '@/components/HamburgerMenu'
import { StocklyLogo } from '@/components/StocklyLogo'
import { STARTER_UNITS } from '@/lib/starter-lessons'
import { BUILDER_UNITS } from '@/lib/builder-lessons'

interface TrackInfo {
  id: string
  title: string
  subtitle: string
  emoji: string
  href: string
  xpKey: string
  progressKey: string
  totalLessons: number
  finalLessonId: string
  requiredLevel: string[]
}

const TRACKS: TrackInfo[] = [
  {
    id: 'starter',
    title: 'Starter',
    subtitle: 'What stocks are, how the market works, and how to buy your first share.',
    emoji: '🌱',
    href: '/learn/starter',
    xpKey: 'stockly_starter_xp',
    progressKey: 'stockly_starter_progress',
    totalLessons: STARTER_UNITS.reduce((a, u) => a + u.lessons.length, 0),
    finalLessonId: 'u4-l5',
    requiredLevel: ['starter', 'builder', 'leveler'],
  },
  {
    id: 'builder',
    title: 'Builder',
    subtitle: 'Read stock pages, research companies, place orders, and build a real portfolio.',
    emoji: '🔨',
    href: '/learn/builder',
    xpKey: 'stockly_builder_xp',
    progressKey: 'stockly_builder_progress',
    totalLessons: BUILDER_UNITS.reduce((a, u) => a + u.lessons.length, 0),
    finalLessonId: 'b3-l5',
    requiredLevel: ['builder', 'leveler'],
  },
  {
    id: 'leveler',
    title: 'Leveler',
    subtitle: 'Charts, technical analysis, risk management, and building a real strategy.',
    emoji: '📈',
    href: '/learn/leveler',
    xpKey: 'stockly_leveler_xp',
    progressKey: 'stockly_leveler_progress',
    totalLessons: 0,
    finalLessonId: '',
    requiredLevel: ['leveler'],
  },
  {
    id: 'wealth',
    title: 'Wealth Building',
    subtitle: 'Assets, compound interest, and building generational wealth.',
    emoji: '💎',
    href: '/learn/wealth',
    xpKey: 'stockly_wealth_xp',
    progressKey: 'stockly_wealth_progress',
    totalLessons: 0,
    finalLessonId: '',
    requiredLevel: ['starter', 'builder', 'leveler'],
  },
]

function loadProgress(key: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function LearnDashboard() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [userPlan, setUserPlan] = useState<string | null>(null)
  const [userLevel, setUserLevel] = useState('starter')
  const [progressMap, setProgressMap] = useState<Record<string, Record<string, boolean>>>({})
  const [xpMap, setXPMap] = useState<Record<string, number>>({})

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) { router.push('/auth'); return }

    setUserName(user.name.split(' ')[0])
    setUserPlan(user.plan)

    const level = localStorage.getItem('stockly_level') ?? user.track ?? 'starter'
    setUserLevel(level)

    const pm: Record<string, Record<string, boolean>> = {}
    const xm: Record<string, number> = {}
    TRACKS.forEach((t) => {
      pm[t.id] = loadProgress(t.progressKey)
      xm[t.id] = parseInt(localStorage.getItem(t.xpKey) ?? '0', 10)
    })
    setProgressMap(pm)
    setXPMap(xm)
  }, [router])

  function isTrackUnlocked(track: TrackInfo): boolean {
    // always unlock starter
    if (track.id === 'starter') return true

    // builder: unlocked if user tested into builder/leveler OR completed starter
    if (track.id === 'builder') {
      if (['builder', 'leveler'].includes(userLevel)) return true
      const starterProgress = progressMap['starter'] ?? {}
      return !!starterProgress['u4-l5']
    }

    // leveler: unlocked if user tested into leveler OR completed builder
    if (track.id === 'leveler') {
      if (userLevel === 'leveler') return true
      const builderProgress = progressMap['builder'] ?? {}
      return !!builderProgress['b3-l5']
    }

    // wealth: unlocked after completing leveler
    if (track.id === 'wealth') {
      const levelerProgress = progressMap['leveler'] ?? {}
      return !!levelerProgress['lv3-l5']
    }

    return false
  }

  function getTrackProgress(track: TrackInfo): number {
    if (track.totalLessons === 0) return 0
    const p = progressMap[track.id] ?? {}
    const done = Object.values(p).filter(Boolean).length
    return Math.round((done / track.totalLessons) * 100)
  }

  function isTrackComplete(track: TrackInfo): boolean {
    if (!track.finalLessonId) return false
    const p = progressMap[track.id] ?? {}
    return !!p[track.finalLessonId]
  }

  function handleTrackTap(track: TrackInfo) {
    if (!isTrackUnlocked(track)) return
    if (track.totalLessons === 0) return // coming soon
    router.push(track.href)
  }

  const totalXP = Object.values(xpMap).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-sm mx-auto px-6 py-6 pb-20 min-h-screen">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <HamburgerMenu userName={userName} userPlan={userPlan} />
        <div className="flex items-center -space-x-1">
          <StocklyLogo size={28} />
          <span className="text-xl font-black text-brand-white tracking-tight leading-none">tockly</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-brand-green text-xs font-black">⚡ {totalXP} XP</span>
        </div>
      </div>

      {/* Welcome */}
      <div className="mb-6 animate-slideUp">
        <h1 className="text-2xl font-black text-brand-white">
          {userName ? `Welcome back, ${userName}.` : 'Your Learning Path'}
        </h1>
        <p className="text-brand-muted text-sm mt-1">Pick up where you left off.</p>
      </div>

      {/* Tracks */}
      <div className="flex flex-col gap-4">
        {TRACKS.map((track) => {
          const unlocked = isTrackUnlocked(track)
          const complete = isTrackComplete(track)
          const pct = getTrackProgress(track)
          const comingSoon = track.totalLessons === 0

          return (
            <button
              key={track.id}
              onClick={() => handleTrackTap(track)}
              disabled={!unlocked || comingSoon}
              className={`w-full text-left rounded-3xl border-2 p-5 transition-all active:scale-95 ${
                !unlocked
                  ? 'bg-brand-surface/40 border-white/5 opacity-50'
                  : complete
                  ? 'bg-brand-green/10 border-brand-green'
                  : pct > 0
                  ? 'bg-brand-surface border-brand-purple shadow-lg shadow-brand-purple/20'
                  : 'bg-brand-surface border-white/15'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${
                  !unlocked ? 'bg-white/5' : complete ? 'bg-brand-green/20' : 'bg-brand-purple/20'
                }`}>
                  {!unlocked ? '🔒' : complete ? '✅' : track.emoji}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className={`font-black text-base ${!unlocked ? 'text-brand-muted' : 'text-brand-white'}`}>
                      {track.title} Track
                    </h2>
                    {comingSoon && unlocked && (
                      <span className="text-xs bg-brand-purple/20 text-brand-purple border border-brand-purple/40 px-2 py-0.5 rounded-full font-semibold">
                        Coming Soon
                      </span>
                    )}
                    {complete && (
                      <span className="text-xs bg-brand-green/20 text-brand-green border border-brand-green/40 px-2 py-0.5 rounded-full font-semibold">
                        Complete
                      </span>
                    )}
                  </div>
                  <p className={`text-xs leading-relaxed ${!unlocked ? 'text-brand-muted/60' : 'text-brand-muted'}`}>
                    {!unlocked
                      ? track.id === 'builder'
                        ? 'Complete the Starter track to unlock'
                        : track.id === 'leveler'
                        ? 'Complete the Builder track to unlock'
                        : 'Complete all tracks to unlock'
                      : track.subtitle}
                  </p>

                  {/* Progress bar */}
                  {unlocked && !comingSoon && track.totalLessons > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-700 ${complete ? 'bg-brand-green' : 'bg-brand-purple'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold flex-shrink-0 ${complete ? 'text-brand-green' : 'text-brand-muted'}`}>
                          {pct}%
                        </span>
                      </div>
                      <p className="text-brand-muted/60 text-xs mt-1">
                        {xpMap[track.id] > 0 ? `${xpMap[track.id]} XP earned` : `${track.totalLessons} lessons`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {unlocked && !comingSoon && (
                  <span className={`text-lg flex-shrink-0 mt-1 ${complete ? 'text-brand-green' : 'text-brand-purple'}`}>
                    →
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

    </div>
  )
}
