import type { LessonSlide, StockDefinition, Scenario } from '@/types'

// XP needed to reach each level (index = level number)
// Level 1: 0 XP, Level 2: 50 XP, Level 3: 120 XP, etc.
export const XP_LEVELS = [0, 50, 120, 220, 350]

export const STORAGE_KEY = 'stockgame_v1'

// The two example stocks used in the simulator
export const STOCK_DEFINITIONS: StockDefinition[] = [
  { ticker: 'PZZA', name: 'Pizza Corp',    basePrice: 50,  emoji: '🍕' },
  { ticker: 'BOBA', name: 'Boba Tea Co.',  basePrice: 30,  emoji: '🧋' },
]

// Pre-scripted opening prices — trends upward to make buying feel rewarding right away
export const SCRIPTED_PRICES: Record<string, number[]> = {
  PZZA: [50, 51, 53, 52, 55, 57, 56, 60, 58, 61, 63, 62, 65, 64, 67, 68, 66, 70, 69, 72],
  BOBA: [30, 29, 31, 33, 32, 35, 34, 36, 38, 37, 40, 39, 42, 41, 43, 45, 44, 46, 48, 47],
}

// The 6-slide lesson on "What is a stock?"
export const LESSON_SLIDES: LessonSlide[] = [
  {
    id: 'slide-1',
    type: 'text-analogy',
    heading: 'What is a stock?',
    body: 'Imagine your friend opens a pizza shop. They need money to buy ovens and ingredients. So they split the shop into 100 tiny pieces and sell them. Each piece is called a stock.',
    emoji: '🍕',
  },
  {
    id: 'slide-2',
    type: 'text-analogy',
    heading: 'You can own a slice',
    body: 'If you buy 1 piece (stock) of the pizza shop, you own 1% of it! If the shop makes money, your piece becomes worth more. If it loses money, your piece is worth less.',
    emoji: '📈',
  },
  {
    id: 'slide-3',
    type: 'interactive-tap',
    heading: 'Why do prices change?',
    body: 'Tap the stock to find out what makes its price go up!',
    emoji: '🤔',
    tapReveal: {
      prompt: 'Tap to reveal the secret!',
      hiddenText: 'When lots of people WANT to buy a stock, the price goes UP. When people want to SELL, the price goes DOWN. It\'s like a hot toy at Christmas — more demand = higher price! 🎯',
    },
  },
  {
    id: 'slide-4',
    type: 'quiz',
    heading: 'Quick check!',
    body: 'Let\'s make sure you got that.',
    emoji: '🧠',
    quiz: {
      question: 'If everyone suddenly wants to buy Pizza Corp stock, what happens to its price?',
      options: ['It goes DOWN 📉', 'It goes UP 📈', 'It stays the same ➡️'],
      correctIndex: 1,
      explanation: 'Correct! More buyers = higher price. Think of it like an auction — the more people who want something, the more they\'re willing to pay for it.',
      xpReward: 10,
    },
  },
  {
    id: 'slide-5',
    type: 'text-analogy',
    heading: 'Real companies, real stocks',
    body: 'Apple, Nike, and McDonald\'s are all public companies. Anyone can buy a small piece of them. When you buy stock, you\'re becoming a tiny part-owner of that company!',
    emoji: '🏢',
  },
  {
    id: 'slide-6',
    type: 'summary',
    heading: 'You\'re ready to trade! 🎉',
    body: 'Here\'s what you learned:\n• A stock = a small piece of a company\n• More buyers → price goes up\n• More sellers → price goes down',
    emoji: '🚀',
  },
]

export const SCENARIOS: Scenario[] = [
  {
    id: 'scenario-1',
    emoji: '📉',
    prompt: "Pizza Corp's stock just dropped 20% because of bad news about cheese prices.",
    context: "You own 5 shares of PZZA. You're nervous. What do you do?",
    options: [
      'Panic and sell everything immediately',
      'Research why before making any decision',
      'Buy even more shares right now',
    ],
    correctIndex: 1,
    explanation: "Smart move! Good investors don't panic — they research first. The drop might be temporary, or there might be a real problem. Selling in panic or blindly buying more are both risky without information.",
    xpReward: 30,
  },
  {
    id: 'scenario-2',
    emoji: '📰',
    prompt: 'You hear a rumor at school that Boba Tea Co. is about to release a new drink and the stock will "definitely go up."',
    context: "Your friend says it's a sure thing. Should you invest all your money?",
    options: [
      'Put all your money in immediately — free money!',
      'Ignore it — rumors are never true',
      "Invest a small amount you're okay losing, and wait to see real news",
    ],
    correctIndex: 2,
    explanation: "Rumors can be exciting, but acting on them is risky. Smart investors wait for real news and never bet everything on a tip. Investing a small amount limits your downside while still letting you participate.",
    xpReward: 30,
  },
  {
    id: 'scenario-3',
    emoji: '🚀',
    prompt: "Pizza Corp's stock has gone up 80% in the last two weeks. Everyone online is talking about it.",
    context: "You haven't bought any yet. Should you jump in now?",
    options: [
      "Buy as much as possible — it's clearly a winner",
      'It\'s too late, the opportunity is gone forever',
      'Research the company before deciding — big run-ups can reverse fast',
    ],
    correctIndex: 2,
    explanation: "Stocks that shoot up fast can drop just as fast. This is called FOMO (Fear Of Missing Out) — one of the biggest traps for new investors. Always research before buying, especially after a big run-up.",
    xpReward: 30,
  },
  {
    id: 'scenario-4',
    emoji: '💸',
    prompt: 'The whole market drops 10% today because of news about the economy. Both PZZA and BOBA are down.',
    context: "You have $500 saved. What's the smartest move?",
    options: [
      'Sell everything to avoid losing more money',
      'Do nothing — wait and watch before acting',
      'Spend your $500 on something fun instead',
    ],
    correctIndex: 1,
    explanation: "Market-wide drops are normal and usually temporary. Selling locks in your losses. Doing nothing and watching is often the right call — especially for beginners. The market has recovered from every crash in history.",
    xpReward: 30,
  },
  {
    id: 'scenario-5',
    emoji: '🏆',
    prompt: 'You bought 3 shares of BOBA at $30 each. It\'s now at $45 — up 50%!',
    context: "You're up $45 total. What do you do?",
    options: [
      'Sell all 3 shares and take the profit',
      'Hold forever — it will keep going up',
      'Sell 1-2 shares to lock in some profit, keep the rest to grow',
    ],
    correctIndex: 2,
    explanation: "Taking some profit while letting the rest ride is a classic strategy. It reduces your risk (you've already made money) while keeping upside potential. Neither panic-selling everything nor blindly holding forever is optimal.",
    xpReward: 30,
  },
]
