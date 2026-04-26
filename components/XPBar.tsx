'use client'

import { useRef, useEffect, useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { xpBarPercent } from '@/lib/gameState'
import { XP_LEVELS } from '@/lib/constants'
import { ProgressBar } from './ui/ProgressBar'
import { XPPopup } from './XPPopup'
import { LevelUpModal } from './LevelUpModal'

export function XPBar() {
  const { state } = useGameState()
  const prevXPRef = useRef(state.xp)
  const prevLevelRef = useRef(state.level)

  const [popupDelta, setPopupDelta] = useState<number | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  useEffect(() => {
    const gained = state.xp - prevXPRef.current
    if (gained > 0) {
      setPopupDelta(gained)
    }
    if (state.level > prevLevelRef.current) {
      setShowLevelUp(true)
    }
    prevXPRef.current = state.xp
    prevLevelRef.current = state.level
  }, [state.xp, state.level])

  const fillPct = xpBarPercent(state.xp, state.level)
  const maxLevel = XP_LEVELS.length
  const isMaxLevel = state.level >= maxLevel

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-brand-purple px-4 py-2 flex items-center gap-3">
        <div className="flex-shrink-0 bg-brand-coral text-brand-navy text-xs font-black px-2 py-1 rounded-full">
          LVL {state.level}
        </div>
        <div className="flex-1">
          <ProgressBar value={fillPct} />
        </div>
        <div className="flex-shrink-0 text-brand-coral text-xs font-bold">
          {isMaxLevel ? 'MAX' : `${state.xp} XP`}
        </div>
      </div>

      {popupDelta !== null && (
        <XPPopup amount={popupDelta} onComplete={() => setPopupDelta(null)} />
      )}

      {showLevelUp && (
        <LevelUpModal newLevel={state.level} onDismiss={() => setShowLevelUp(false)} />
      )}
    </>
  )
}
