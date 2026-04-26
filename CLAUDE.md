# Stockly — Gamified Stock Learning App

## Project Origin
Originally built as "StockQuest" in a single Claude Code session. Rebranded and redesigned as **Stockly** in a subsequent session (2026-04-22). The vision is a Duolingo-style stock education platform built for people who were never given access to financial education — especially women, young adults, and first-gen wealth builders.

## What This App Is
A mobile-first, beginner-friendly stock education app. Bright, playful, and welcoming — feels like playing, not studying. Users go through a disclaimer → mindset intro → placement test → personalized learning track. All state stored in localStorage, no backend required.

## Brand
- **Name**: Stockly
- **Tagline**: Learning stocks, simplified.
- **Tone**: Warm, conversational, judgment-free. Like a smart friend explaining things — not a professor.
- **Inspired by**: Duolingo (interaction style), You Deserve to Be Rich (wealth mindset content)
- **Mascot**: Planned — placeholder exists on home screen

## Color System
| Role | Color | Hex |
|---|---|---|
| Background | Soft Cream | `#FFF8F0` |
| Surface / Cards | White | `#FFFFFF` |
| Primary / Buttons | Electric Purple | `#7C3AED` |
| Card Tint | Light Purple | `#EDE9FF` |
| Button Accent | Hot Coral | `#FFD60A` |
| Rewards / XP | Yellow | `#FFD609` |
| Progress / Success | Cyan | `#00C2FF` |
| Text Primary | Dark Navy Purple | `#1E1E2F` |
| Text Muted | Muted Navy | `#6B6B8A` |
| Error | Coral Red | `#FF6B6B` |

Tailwind tokens: `brand-purple`, `brand-purple-light`, `brand-coral`, `brand-yellow`, `brand-cyan`, `brand-cream`, `brand-navy`, `brand-navy-muted`

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Persistence**: localStorage only (key: `stockgame_v1`)
- **Stock data**: Client-side simulation (no API needed)

## Location
- Cloned from GitHub: `ns3smith-oss/stock-game`
- Local path: `~/stock-game`
- Run: `cd ~/stock-game && npm run dev` → http://localhost:3000

## Full User Flow
```
Home (/)
  └─ Disclaimer (/disclaimer)
       └─ Onboarding — 4 wealth mindset slides (/onboarding)
            └─ Placement Test — 8 questions (/placement)
                 └─ Result → routed to track
                      ├─ Starter Track (/learn/starter)
                      ├─ Builder Track (/learn/builder)
                      └─ Leveler Track (/learn/leveler)
                           └─ [All tracks] → Wealth Building Closer (coming soon)
```

## Placement Test
8 questions, friendly conversational tone, no shame. Auto-advances on tap (400ms delay). Scores map to:
- 0–4 pts → **Starter** ("Brand New")
- 5–10 pts → **Builder** ("Curious & Learning")
- 11+ pts → **Leveler** ("Ready to Level Up")

Question 7 (biggest fear) does not affect score — used for future personalization of lesson tone.

## Learning Track Content Plan

### Onboarding Wealth Mindset Intro (4 slides — shown before placement test)
1. Why most people never build wealth — and it's not their fault
2. Rich vs. poor mindset
3. Consumer vs. Builder
4. Pay yourself first

### Starter Track (9 lessons — not yet built)
1. What is a stock, really?
2. What is the stock market and who's actually in it?
3. Why do stock prices go up and down?
4. What is a broker and how do you actually buy a stock?
5. What is a portfolio?
6. The difference between saving money and investing money
7. Why people are scared of investing — and why that makes sense
8. What is risk and how do you think about it?
9. Your first goal: what does "starting small" actually look like?

### Builder Track (10 lessons — not yet built)
1. Quick recap: what you probably already know
2. Types of investments — stocks, ETFs, index funds explained simply
3. How to actually read a stock page
4. What is a bull and bear market?
5. How to research a company before buying
6. What is diversification and why does it protect you?
7. Understanding risk vs reward
8. What is a limit order vs a market order?
9. How to make your first trade without panicking
10. Building a simple beginner portfolio from scratch

### Leveler Track (10 lessons — not yet built)
1. How to read a basic price chart
2. Support and resistance
3. What is volume telling you?
4. Short term vs long term — which is right for you?
5. Risk management: position sizing and the 1% rule
6. Stop loss and take profit
7. How to spot when a stock is being manipulated
8. Reading earnings reports without being confused
9. What market cycles look like and how to use them
10. Building a real strategy that fits your life and goals

### Wealth Building Closer (6 lessons — unlocks after all tracks, not yet built)
5. The difference between an asset and a liability
6. How the wealthy use the stock market as a tool, not a gamble
7. Saving with purpose — emergency fund, investment fund, spending money
8. Compound interest — why starting early beats starting big
9. Generational wealth — what it is and how regular people build it
10. Your next step — you have the knowledge, now build the habit

## Disclaimer
Shown as a dedicated screen before onboarding. User must tap "I understand" to proceed. Plain language — not fine print. Covers: education not advice, trading involves real risk, Stockly is in your corner.

## Project Structure
```
stock-game/
├── app/
│   ├── layout.tsx              # Root layout — mounts XPBar, brand-purple bg
│   ├── page.tsx                # Home — logo, tagline, mascot placeholder, CTA
│   ├── globals.css             # Tailwind directives + iOS overscroll fix
│   ├── disclaimer/page.tsx     # Disclaimer screen — must acknowledge to continue
│   ├── onboarding/page.tsx     # 4 wealth mindset slides before placement test
│   ├── placement/page.tsx      # 8-question placement test → routes to track
│   ├── learn/
│   │   ├── starter/page.tsx    # Starter track (placeholder)
│   │   ├── builder/page.tsx    # Builder track (placeholder)
│   │   └── leveler/page.tsx    # Leveler track (placeholder)
│   ├── lesson/page.tsx         # Legacy lesson module (to be replaced)
│   ├── simulator/page.tsx      # Trading simulator (to be redesigned)
│   └── challenge/page.tsx      # Scenario challenge (to be redesigned)
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Badge.tsx
│   ├── XPBar.tsx               # Fixed top bar — updated to Stockly colors
│   ├── XPPopup.tsx
│   ├── LevelUpModal.tsx
│   ├── ModuleCard.tsx
│   ├── LessonCard.tsx
│   ├── LessonFlow.tsx
│   ├── StockChart.tsx
│   ├── Portfolio.tsx
│   ├── TradePanel.tsx
│   ├── TradingSimulator.tsx
│   └── ScenarioChallenge.tsx
├── hooks/
│   ├── useGameState.ts
│   └── useStockTicker.ts
├── lib/
│   ├── gameState.ts
│   ├── stockSimulator.ts
│   ├── constants.ts
│   └── utils.ts
├── types/index.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## XP System
- Thresholds: `[0, 50, 120, 220, 350]` (index = level number)
- XPBar visible on every page via layout.tsx

## Key Architecture Decisions
- **No backend** — zero infrastructure, works offline
- **SSR-safe** — all localStorage reads inside useEffect or guarded with `typeof window !== 'undefined'`
- **Pure functions** — `lib/gameState.ts` has zero React imports
- **Storage key versioned** — `stockgame_v1`

## What To Do Next
1. Build out Starter track lessons (9 lessons, tap-through format)
2. Build out Builder and Leveler track lessons
3. Redesign simulator with Stockly color system
4. Add mascot to home screen when character is decided
5. Build Wealth Building closer track
6. Deploy to Vercel

---
*Last updated: 2026-04-26 — New color system applied (cream bg, electric purple, cyan progress, coral XP badge) across all screens*
*To update this file: tell Claude "update CLAUDE.md" at the end of each session*
