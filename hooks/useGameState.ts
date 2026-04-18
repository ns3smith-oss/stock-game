'use client'

// React hook that wraps the pure gameState.ts functions.
// Handles SSR safety: localStorage is only accessed in useEffect (client-side).

import { useState, useEffect, useCallback } from 'react'
import type { GameProgress } from '@/types'
import {
  loadGameState,
  saveGameState,
  addXP as addXPPure,
  completeLesson as completeLessonPure,
  completeChallenge as completeChallengePure,
  executeTrade as executeTradePure,
  DEFAULT_GAME_STATE,
} from '@/lib/gameState'

export function useGameState() {
  // Start with default state (safe for SSR), then hydrate from localStorage
  const [state, setState] = useState<GameProgress>(DEFAULT_GAME_STATE)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const saved = loadGameState()
    setState(saved)
    setHydrated(true)
  }, [])

  // Helper: update state AND persist to localStorage atomically
  const update = useCallback((newState: GameProgress) => {
    setState(newState)
    saveGameState(newState)
  }, [])

  const addXP = useCallback(
    (amount: number) => {
      setState((prev) => {
        const next = addXPPure(prev, amount)
        saveGameState(next)
        return next
      })
    },
    []
  )

  const completeLesson = useCallback(() => {
    setState((prev) => {
      const next = completeLessonPure(prev)
      saveGameState(next)
      return next
    })
  }, [])

  const completeChallenge = useCallback((scenarioId: string, wasCorrect: boolean) => {
    setState((prev) => {
      const next = completeChallengePure(prev, scenarioId, wasCorrect)
      saveGameState(next)
      return next
    })
  }, [])

  const executeTrade = useCallback(
    (ticker: string, action: 'buy' | 'sell', quantity: number, price: number) => {
      setState((prev) => {
        const next = executeTradePure(prev, ticker, action, quantity, price)
        saveGameState(next)
        return next
      })
    },
    []
  )

  const resetGame = useCallback(() => {
    update({ ...DEFAULT_GAME_STATE, lastUpdated: Date.now() })
  }, [update])

  return {
    state,
    hydrated,
    addXP,
    completeLesson,
    completeChallenge,
    executeTrade,
    resetGame,
  }
}
