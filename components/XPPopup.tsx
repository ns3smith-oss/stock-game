'use client'

import { useEffect } from 'react'

interface XPPopupProps {
  amount: number
  onComplete: () => void
}

// Floating "+XP" animation that auto-removes itself after the animation finishes.
export function XPPopup({ amount, onComplete }: XPPopupProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1200)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xpFloat">
      <span className="text-2xl font-black text-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
        +{amount} XP ⭐
      </span>
    </div>
  )
}
