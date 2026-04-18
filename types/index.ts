// All shared TypeScript interfaces for the stock game

export interface LessonSlide {
  id: string
  type: 'text-analogy' | 'interactive-tap' | 'quiz' | 'summary'
  heading: string
  body: string
  emoji?: string
  quiz?: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
    xpReward: number
  }
  tapReveal?: {
    prompt: string     // what to show before tap
    hiddenText: string // what's revealed on tap
  }
}

export interface LessonProgress {
  completed: boolean
  currentSlideIndex: number
  quizAnsweredCorrectly: boolean
}

export interface StockDefinition {
  ticker: string
  name: string
  basePrice: number
  emoji: string
}

export interface PortfolioHolding {
  ticker: string
  sharesOwned: number
  averageBuyPrice: number
}

export interface TradeRecord {
  ticker: string
  action: 'buy' | 'sell'
  quantity: number
  priceAtTime: number
  timestamp: number
}

export interface PortfolioState {
  cashBalance: number
  holdings: PortfolioHolding[]
  hasCompletedFirstTrade: boolean
  tradeHistory: TradeRecord[]
}

export interface ChallengeProgress {
  completed: boolean
  lastScenarioId: string | null
  wasCorrect: boolean | null
}

export interface GameProgress {
  xp: number
  level: number
  lessonProgress: LessonProgress
  portfolioState: PortfolioState
  challengeProgress: ChallengeProgress
  lastUpdated: number
}

export interface Scenario {
  id: string
  prompt: string
  context: string
  options: string[]
  correctIndex: number
  explanation: string
  xpReward: number
  emoji: string
}
