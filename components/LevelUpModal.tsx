'use client'

import { useEffect } from 'react'

interface LevelUpModalProps {
  newLevel: number
  onDismiss: () => void
}

const ENCOURAGING = [
  "You're on fire! 🔥",
  "Keep crushing it! 💪",
  "Stock market pro incoming! 📈",
  "Unstoppable! ⚡",
]

export function LevelUpModal({ newLevel, onDismiss }: LevelUpModalProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const praise = ENCOURAGING[(newLevel - 2) % ENCOURAGING.length]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div className="text-center animate-levelBurst">
        <div className="text-7xl mb-3">🏆</div>
        <div className="text-5xl font-black text-gold mb-2">LEVEL {newLevel}!</div>
        <div className="text-white text-xl font-semibold">{praise}</div>
        <div className="text-gray-400 text-sm mt-4">Tap anywhere to continue</div>
      </div>
    </div>
  )
}
