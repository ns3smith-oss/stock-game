// Pure functions for reading/writing game state to localStorage.
// No React imports here — these are plain functions usable anywhere.

import type { GameProgress, PortfolioHolding } from '@/types'
import { STORAGE_KEY, XP_LEVELS } from './constants'

export const DEFAULT_GAME_STATE: GameProgress = {
  xp: 0,
  level: 1,
  lessonProgress: {
    completed: false,
    currentSlideIndex: 0,
    quizAnsweredCorrectly: false,
  },
  portfolioState: {
    cashBalance: 1000,
    holdings: [],
    hasCompletedFirstTrade: false,
    tradeHistory: [],
  },
  challengeProgress: {
    completed: false,
    lastScenarioId: null,
    wasCorrect: null,
  },
  lastUpdated: Date.now(),
}

export function loadGameState(): GameProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_GAME_STATE }
    return JSON.parse(raw) as GameProgress
  } catch {
    // Corrupt state — start fresh
    return { ...DEFAULT_GAME_STATE }
  }
}

export function saveGameState(state: GameProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage quota exceeded — silently fail for MVP
  }
}

export function calculateLevel(xp: number): number {
  let level = 1
  for (let i = 1; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i]) level = i + 1
    else break
  }
  return level
}

// Returns a new GameProgress with XP added and level recalculated.
export function addXP(state: GameProgress, amount: number): GameProgress {
  const newXP = state.xp + amount
  const newLevel = calculateLevel(newXP)
  return { ...state, xp: newXP, level: newLevel, lastUpdated: Date.now() }
}

// Returns a new GameProgress with lesson marked complete.
export function completeLesson(state: GameProgress): GameProgress {
  return {
    ...state,
    lessonProgress: { ...state.lessonProgress, completed: true },
    lastUpdated: Date.now(),
  }
}

// Returns a new GameProgress with challenge marked complete.
export function completeChallenge(
  state: GameProgress,
  scenarioId: string,
  wasCorrect: boolean
): GameProgress {
  return {
    ...state,
    challengeProgress: { completed: true, lastScenarioId: scenarioId, wasCorrect },
    lastUpdated: Date.now(),
  }
}

// Executes a buy or sell trade, returning updated state.
// On buy: deduct cash, add shares (or increase average cost basis).
// On sell: add cash, remove/reduce shares.
export function executeTrade(
  state: GameProgress,
  ticker: string,
  action: 'buy' | 'sell',
  quantity: number,
  price: number
): GameProgress {
  const portfolio = state.portfolioState
  const holdings = [...portfolio.holdings]
  const existingIdx = holdings.findIndex((h) => h.ticker === ticker)

  if (action === 'buy') {
    const cost = quantity * price
    if (cost > portfolio.cashBalance) return state // insufficient funds — no-op

    if (existingIdx >= 0) {
      const existing = holdings[existingIdx]
      const totalShares = existing.sharesOwned + quantity
      const avgPrice =
        (existing.averageBuyPrice * existing.sharesOwned + price * quantity) / totalShares
      holdings[existingIdx] = { ...existing, sharesOwned: totalShares, averageBuyPrice: avgPrice }
    } else {
      holdings.push({ ticker, sharesOwned: quantity, averageBuyPrice: price })
    }

    return {
      ...state,
      portfolioState: {
        cashBalance: portfolio.cashBalance - cost,
        holdings,
        hasCompletedFirstTrade: true,
        tradeHistory: [
          ...portfolio.tradeHistory,
          { ticker, action: 'buy', quantity, priceAtTime: price, timestamp: Date.now() },
        ],
      },
      lastUpdated: Date.now(),
    }
  }

  // Sell
  if (existingIdx < 0) return state // no shares to sell
  const existing = holdings[existingIdx]
  if (existing.sharesOwned < quantity) return state // not enough shares

  const newShares = existing.sharesOwned - quantity
  if (newShares === 0) {
    holdings.splice(existingIdx, 1)
  } else {
    holdings[existingIdx] = { ...existing, sharesOwned: newShares }
  }

  return {
    ...state,
    portfolioState: {
      ...portfolio,
      cashBalance: portfolio.cashBalance + quantity * price,
      holdings,
      hasCompletedFirstTrade: true,
      tradeHistory: [
        ...portfolio.tradeHistory,
        { ticker, action: 'sell', quantity, priceAtTime: price, timestamp: Date.now() },
      ],
    },
    lastUpdated: Date.now(),
  }
}

// Dev utility — wipe saved state entirely.
export function resetGameState(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Get the holding for a specific ticker, or undefined.
export function getHolding(state: GameProgress, ticker: string): PortfolioHolding | undefined {
  return state.portfolioState.holdings.find((h) => h.ticker === ticker)
}

// Compute total portfolio value (cash + market value of holdings).
export function totalPortfolioValue(
  state: GameProgress,
  currentPrices: Record<string, number>
): number {
  const marketValue = state.portfolioState.holdings.reduce((sum, h) => {
    return sum + h.sharesOwned * (currentPrices[h.ticker] ?? 0)
  }, 0)
  return state.portfolioState.cashBalance + marketValue
}

// XP needed to fill the current level bar (0–100 percent).
export function xpBarPercent(xp: number, level: number): number {
  const levelStart = XP_LEVELS[level - 1] ?? 0
  const levelEnd   = XP_LEVELS[level]    ?? XP_LEVELS[XP_LEVELS.length - 1]
  if (levelEnd === levelStart) return 100
  return Math.min(100, ((xp - levelStart) / (levelEnd - levelStart)) * 100)
}
