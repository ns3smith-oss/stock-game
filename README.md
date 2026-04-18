# StockQuest

A Duolingo-style stock trading learning app for complete beginners. Built for middle school level — teaches you how stocks work through gameplay, not reading.

---

## What It Does

StockQuest walks you through three unlockable modules in order:

1. **Lesson** — 6 interactive slides with analogies, tap-reveals, and a quiz
2. **Simulator** — trade with $1,000 of fake money using two stocks (PZZA and BOBA)
3. **Challenge** — answer real-world trading scenarios and earn XP for correct answers

Each module unlocks the next. Complete the lesson to unlock the simulator. Make your first trade to unlock the challenge.

---

## XP & Leveling

| Action | XP Earned |
|---|---|
| Complete the lesson | +50 XP |
| First trade | +10 XP |
| Correct challenge answer | +30 XP |
| Quiz correct answer | +10 XP |

Levels: 1 (0–49) → 2 (50–119) → 3 (120–219) → 4 (220–349) → 5 (350+)

---

## The Stocks

| Ticker | Company | Starting Price |
|---|---|---|
| PZZA | Pizza Corp | $50 |
| BOBA | Boba Tea Co | $30 |

Prices update every 3 seconds using a simulated market with a slight upward bias.

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **No backend** — all state saved in `localStorage`
- **No external APIs** — stock prices are simulated client-side

---

## Getting Started

**Requirements:** [Node.js](https://nodejs.org) must be installed.

```bash
git clone https://github.com/ns3smith-oss/stock-game.git
cd stock-game
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
stock-game/
├── app/                    # Next.js pages
│   ├── page.tsx            # Home dashboard
│   ├── lesson/page.tsx     # Lesson module
│   ├── simulator/page.tsx  # Trading simulator
│   └── challenge/page.tsx  # Scenario challenges
├── components/             # UI components
├── hooks/                  # useGameState, useStockTicker
├── lib/                    # Game logic, stock simulation, constants
└── types/                  # Shared TypeScript interfaces
```

---

## Notes

- No account or login required
- Works offline after first load
- Mobile-first design
- Progress resets if browser storage is cleared
