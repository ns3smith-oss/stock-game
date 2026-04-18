# StockQuest — Gamified Stock Trading Learning App

## Project Origin
Built from scratch in a single Claude Code session. The user requested a Duolingo-style stock trading learning app for complete beginners (middle school level). Claude planned the full architecture, then built all 33 files manually (Node.js was not installed, so `npx create-next-app` couldn't run).

## What This App Is
A mobile-first web app that teaches beginners how to trade stocks through gameplay, not reading. Three unlockable modules that must be completed in order. All state stored in localStorage — no backend, no database, no auth required.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Persistence**: localStorage only (key: `stockgame_v1`)
- **Stock data**: Client-side simulation (no API needed)

## Location
- USB drive **NS3** → `/Volumes/NS3/stock-game`
- Drive must be plugged in to access/run the project

## Getting Started (on any computer)
```bash
# 1. Install Node.js first if not installed: https://nodejs.org
# 2. Then:
cd /Volumes/NS3/stock-game
npm install        # only needed first time on each computer
npm run dev        # starts at http://localhost:3000
```

## Project Structure (all 33 files)
```
stock-game/
├── app/
│   ├── layout.tsx          # Root layout — mounts XPBar at top
│   ├── page.tsx            # Home dashboard with 3 module cards
│   ├── globals.css         # Tailwind directives + iOS overscroll fix
│   ├── lesson/page.tsx     # Lesson module page
│   ├── simulator/page.tsx  # Trading simulator page (locked until lesson done)
│   └── challenge/page.tsx  # Scenario challenge page (locked until first trade)
├── components/
│   ├── ui/
│   │   ├── Button.tsx      # 5 variants: primary, secondary, success, danger, ghost
│   │   ├── Card.tsx        # Simple wrapper
│   │   ├── ProgressBar.tsx # Animated fill bar
│   │   └── Badge.tsx       # Small label pill
│   ├── XPBar.tsx           # Fixed top bar — XP fill + level display, always visible
│   ├── XPPopup.tsx         # "+10 XP" float animation, auto-removes after 1.2s
│   ├── LevelUpModal.tsx    # Celebratory modal when XP crosses level threshold
│   ├── ModuleCard.tsx      # Home screen cards — locked/available/complete states
│   ├── LessonCard.tsx      # Renders all 4 slide types (text, tap, quiz, summary)
│   ├── LessonFlow.tsx      # Orchestrates 6 lesson slides, awards XP on completion
│   ├── StockChart.tsx      # SVG sparkline — no charting library, pure math
│   ├── Portfolio.tsx       # Shows cash, shares owned, P&L in color
│   ├── TradePanel.tsx      # Quantity stepper + Buy/Sell buttons with cost preview
│   ├── TradingSimulator.tsx # Composes StockChart + Portfolio + TradePanel
│   └── ScenarioChallenge.tsx # Scenario card, answer buttons, explanation reveal
├── hooks/
│   ├── useGameState.ts     # React wrapper for gameState.ts — SSR-safe localStorage
│   └── useStockTicker.ts   # setInterval (3s) driving live price ticks
├── lib/
│   ├── gameState.ts        # Pure functions: load/save/addXP/executeTrade/calculateLevel
│   ├── stockSimulator.ts   # 20 scripted prices → bounded random walk
│   ├── constants.ts        # Stocks, scripted prices, XP thresholds, lesson slides, scenarios
│   └── utils.ts            # cn() — Tailwind class merger
├── types/index.ts          # All shared interfaces
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## User Flow
```
Home
  └─ Lesson (always unlocked)
       └─ 6 slides: analogy → analogy → tap-reveal → quiz → analogy → summary
            └─ Complete → +50 XP → Simulator unlocks
  └─ Simulator (unlocks after lesson)
       └─ $1,000 fake money, buy/sell PZZA ($50) or BOBA ($30)
            └─ First trade → +10 XP → Challenge unlocks
  └─ Challenge (unlocks after first trade)
       └─ Scenario → pick answer → feedback reveals → +30 XP if correct
```

## Unlock Gates (client-side only)
- **Simulator**: `lessonProgress.completed === true`
- **Challenge**: `portfolioState.hasCompletedFirstTrade === true`

## XP System
- Thresholds: `[0, 50, 120, 220, 350]` (index = level number)
- Level 1: 0–49 XP | Level 2: 50–119 | Level 3: 120–219 | etc.
- XP events: Lesson complete (+50), First trade (+10), Challenge correct (+30), Quiz correct (+10)
- XPBar is in `app/layout.tsx` — visible on every page

## The Two Stocks
| Ticker | Name | Base Price |
|--------|------|-----------|
| PZZA | Pizza Corp | $50 |
| BOBA | Boba Tea Co | $30 |

Prices start with 20 hand-scripted values (trending up for engagement), then switch to a bounded random walk with slight upward bias.

## Key Architecture Decisions
- **No backend** — zero infrastructure needed, works offline
- **SSR-safe** — all `localStorage` reads are inside `useEffect` or guarded with `typeof window !== 'undefined'`
- **Pure functions** — `lib/gameState.ts` has zero React imports, fully testable in isolation
- **No charting library** — `StockChart.tsx` is a hand-rolled SVG sparkline (~30 lines of math)
- **Storage key versioned** — `stockgame_v1` allows future resets without breaking old state

## Current Status (as of 2026-04-17)
- All 33 files written and in place
- `npm install` completed successfully — 106 packages installed
- Node.js is installed on the current machine (Windows 11, D: drive)
- App confirmed working: `npm run dev` serves at `http://localhost:3000` in ~3s
- HTML, XPBar, and React components all render correctly
- No Git repository initialized yet
- Not yet deployed — only accessible on localhost (not outside the network)

## Running on Windows (D: drive)
```bash
cd D:/stock-game
npm install   # only needed first time, or after cloning
npm run dev   # starts at http://localhost:3000
```
Note: Windows may show `TAR_ENTRY_ERROR` warnings during install — these are harmless.
If install fails with `ENOTEMPTY` on `node_modules/next`, delete node_modules using PowerShell:
```powershell
Remove-Item -Path 'D:\stock-game\node_modules' -Recurse -Force
```
Then re-run `npm install`.

## Design Spec
- **Home**: Navy background `#0F172A`, three stacked ModuleCards, pulsing border on available module
- **Lesson**: White bg, dot-progress indicator, large emoji (80px), full-width Next button (56px tall)
- **Simulator**: Dark bg, top 40% chart, middle 25% portfolio, bottom 35% trade panel
- **Challenge**: Purple gradient bg, scenario card 85% width, answer buttons 60px tall, explanation slides up after answer

## What To Do Next
1. Test the full user flow in browser: lesson → simulator → challenge
2. Fix any runtime or UI issues discovered during testing
3. Initialize a Git repository (`git init`)
4. Deploy publicly — Vercel is the easiest option for Next.js (`vercel deploy`)

---
*Last updated: 2026-04-17 — npm install complete, dev server confirmed working on Windows*
*To update this file: tell Claude "update CLAUDE.md" at the end of each session*
