# Stockly — Gamified Stock Learning App

## Project Origin
Originally built as "StockQuest" in a single Claude Code session. Rebranded and redesigned as **Stockly** starting 2026-04-22. The vision is a Duolingo-style stock education platform built for people who were never given access to financial education — especially women, young adults, and first-gen wealth builders.

## What This App Is
A mobile-first, beginner-friendly stock education app. Bright, interactive, and welcoming — feels like playing, not studying. Full 14-screen onboarding flow routes users into a personalized learning track. All state stored in localStorage, no backend required. Fully responsive — desktop view has a persistent sidebar, mobile uses a hamburger drawer.

## Brand
- **Name**: Stockly
- **Tagline**: Learning stocks, simplified.
- **Tone**: Warm, professional, judgment-free. A smart friend explaining things — not a professor. No slang, no talking down.
- **Inspired by**: Duolingo (interaction style, celebrations, streaks), You Deserve to Be Rich (wealth mindset content)
- **Mascot**: Gender-neutral cute bull 🐂 — Duo energy. Full illustrated mascot TBD (commission a designer or use Fiverr/Adobe Express). Emoji placeholder currently in use.
- **Logo**: SVG S-mark — purple ribbon S with candlestick charts overlaid, arrow at top. Lives in `components/StocklyLogo.tsx`. Used inline with "tockly" text as wordmark.

## Color System — Money Moves Palette
| Role | Color | Hex |
|---|---|---|
| Background | Soft Black | `#0D0D0D` |
| Surface / Cards | Dark Gray | `#1A1A1A` |
| Primary / CTA | Hot Purple | `#8B00FF` |
| Success / Highlight | Neon Green | `#39FF14` |
| Text Primary | White | `#FFFFFF` |
| Text Muted | Light Gray | `#A0A0A0` |
| Error | Coral Red | `#FF6B6B` |

Tailwind tokens: `brand-black`, `brand-surface`, `brand-purple`, `brand-green`, `brand-white`, `brand-muted`, `brand-error`

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Animations**: Tailwind keyframes (slideUp, slideIn, logoReveal, shake, pop, bounce, float, fadein, greenGlow, pulseGlow)
- **Confetti**: `canvas-confetti` — fires on correct answers, level ups, course ready screen
- **Haptics**: Web Vibration API — `lib/haptics.ts` (tap, correct, wrong, levelUp, success patterns)
- **Persistence**: localStorage only (key: `stockgame_v1`)
- **Stock data**: Client-side simulation (no API needed)

## Location
- GitHub: `ns3smith-oss/stock-game`
- Local path: `~/stock-game`
- Run: `cd ~/stock-game && npm run dev` → http://localhost:3000

## Full 14-Screen Onboarding Flow
```
Screen 1:  Home (/) — splash loading animation → landing with S+tockly wordmark
Screen 2:  Welcome + Terms (/welcome) — required checkbox, agreement timestamped to localStorage
Screen 3:  Quick Questions (/onboarding/questions) — 5 questions, 4 options each, professional tone
Screen 4:  What to Learn (/onboarding/goal) — 6 options (stocks, options, futures, portfolio, trends, all)
Screen 5:  How Did You Find Us (/onboarding/referral) — 5 options, auto-advances
Screen 6:  How Much Do You Know (/onboarding/level) — 4 options, saves track to localStorage
Screen 7:  Why Are You Here (/onboarding/why) — 5 options including "nobody ever taught me"
Screen 8:  Set Your Routine (/onboarding/routine) — 4 time-of-day options, auto-advances
Screen 9:  Daily Goal (/onboarding/daily-goal) — 4 options with continue button
Screen 10: Hype Screen (/onboarding/hype) — confetti + haptics, mascot celebrating, personalized message
Screen 11: Plan Selection (/onboarding/plan) — Free vs Pro side by side
Screen 12: Start Choice (/onboarding/start-choice) — basics vs test out
Screen 13: Knowledge Check (/onboarding/knowledge-check) — 5 questions, confetti on correct, shake on wrong
Screen 14: Course Ready (/onboarding/course-ready) — confetti streams, personalized summary, Start Learning CTA
```

## localStorage Keys (onboarding)
| Key | Value |
|---|---|
| `stockly_terms_agreed` | `{ agreed, timestamp, sessionId }` — legal record of terms acceptance |
| `stockly_quick_answers` | Array of 5 quick question answers |
| `stockly_goal` | Selected learning goal |
| `stockly_referral` | How they found Stockly |
| `stockly_level` | `starter` / `builder` / `leveler` |
| `stockly_why` | Why they're learning |
| `stockly_routine` | Preferred learning time |
| `stockly_daily_goal` | Daily time commitment |
| `stockly_plan` | `free` / `pro` |
| `stockly_start_choice` | `basics` / `test` |
| `stockly_knowledge_score` | Score from knowledge check (0–5) |

## Interactivity System
- **Haptics** (`lib/haptics.ts`): tap (10ms), correct (50ms), wrong (80-60-80ms), levelUp (100-50-100-50-200ms), success (50-30-100ms)
- **Confetti** (`lib/celebrate.ts`): `celebrateCorrect()`, `celebrateLevelUp()`, `celebrateCourseReady()`
- **Animations**: Shake on wrong answer, pop on selection, bounce on mascot, slideIn on new questions
- **Button feedback**: All buttons have `active:scale-95` press feel

## Plan Tiers
**Free:**
- Beginner stock crash course
- Human language glossary
- Basic concepts with visuals
- 1–2 mock trading scenarios
- Daily stock fact

**Pro ($5.99/mo):**
- Everything in Free
- Advanced lessons & strategies
- Full mock trading simulator
- Weekly Insights newsletter
- Personalized learning path
- Goal tracker & risk calculator
- Portfolio setup guide
- "What if" tool

## Learning Track Content Plan

### Starter Track ✅ BUILT — 4 units, 17 lessons, 4 interactive demos
- Unit 1: What is a Stock? (pizza shop analogy + order ticket demo, real ownership, IPOs, unit quiz)
- Unit 2: How the Market Works (market overview, supply/demand demo, price movement, unit quiz)
- Unit 3: Getting Started (brokers, how to buy, portfolios, ETFs, unit quiz)
- Unit 4: Money & Risk (saving vs investing + growth demo, fear, risk, DCA demo + starting small, final quiz)

### Builder Track ✅ BUILT — 3 units, 13 lessons, 3 interactive demos
- Unit 1: Know Your Investments (recap, types of investments, stock page + 52-week range demo, unit quiz)
- Unit 2: Reading the Market (bull/bear + phase chart demo, company research, diversification, unit quiz)
- Unit 3: Making Your Move (risk/reward, orders, first trade, portfolio + diversification demo, final quiz)

### Leveler Track ✅ BUILT — 3 units, 14 lessons, 2 interactive demos + 1 anatomy demo
- Unit 1: Reading the Charts (price chart reading + candlestick anatomy demo, support/resistance + 52-week range demo, volume, unit quiz)
- Unit 2: Timing & Risk (short vs long term, risk management + 1% rule, stop loss + take profit, manipulation spotting, unit quiz)
- Unit 3: The Full Picture (earnings reports, market cycles + bull/bear demo, building a strategy, pre-trade checklist, final quiz)
- Final lesson ID: `lv3-l5` — unlocks Wealth Building track

### Wealth Building Track ✅ BUILT — 3 units, 11 lessons — unlocks after Leveler (`lv3-l5` complete)
- Unit 1: wb1-l1 (Assets vs Liabilities), wb1-l2 (How Wealthy Use Market), wb1-l3 (Starting Small — $150 reality), wb1-l4 (Quiz)
- Unit 2: wb2-l1 (Saving With Purpose), wb2-l2 (Compound Interest + savings-vs-investing demo), wb2-l3 (ETFs vs Stocks + portfolio-bars demo), wb2-l4 (Quiz)
- Unit 3: wb3-l1 (Generational Wealth), wb3-l2 (Your Next Step), wb3-l3 (Final Quiz)
- Final lesson ID: `wb3-l3`
- Progress key: `stockly_wealth_progress` | XP key: `stockly_wealth_xp`

### Options Trading Track ✅ BUILT — 4 units, 20 lessons — unlocks after Builder (`b3-l5` complete)
- Unit 1 (op1, blue-500): The Contract — what you own, calls/puts, premium, reading the chain + options-chain demo, strike + expiration, ITM/ATM/OTM, quiz
- Unit 2 (op2, brand-purple): The Greeks — delta, theta + theta-decay demo, implied volatility, gamma/vega, quiz
- Unit 3 (op3, brand-green): Entries & Exits — buying calls, buying puts, position sizing + position-sizing demo, managing the trade, quiz
- Unit 4 (op4, red-400): Real Strategy — trend trading, support/resistance + price-range demo, earnings plays, the Wheel, final quiz (40 XP)
- Final lesson ID: `op4-l5`
- Progress key: `stockly_options_progress` | XP key: `stockly_options_xp`

## Project Structure
```
stock-game/
├── app/
│   ├── layout.tsx                          # Root layout — DesktopSidebar + md:flex, brand-black bg
│   ├── page.tsx                            # Home — splash animation + landing with S+tockly wordmark
│   ├── globals.css
│   ├── welcome/page.tsx                    # Screen 2 — terms checkbox, timestamped agreement
│   ├── onboarding/
│   │   ├── questions/page.tsx              # Screen 3 — 5 quick questions
│   │   ├── goal/page.tsx                   # Screen 4 — what to learn
│   │   ├── referral/page.tsx               # Screen 5 — how did you find us
│   │   ├── level/page.tsx                  # Screen 6 — how much do you know
│   │   ├── why/page.tsx                    # Screen 7 — why are you learning
│   │   ├── routine/page.tsx                # Screen 8 — when do you learn
│   │   ├── daily-goal/page.tsx             # Screen 9 — daily time goal
│   │   ├── hype/page.tsx                   # Screen 10 — celebration + encouragement
│   │   ├── plan/page.tsx                   # Screen 11 — free vs pro
│   │   ├── start-choice/page.tsx           # Screen 12 — basics vs test out
│   │   ├── knowledge-check/page.tsx        # Screen 13 — 5-question knowledge quiz
│   │   └── course-ready/page.tsx           # Screen 14 — personalized course reveal
│   ├── learn/
│   │   ├── page.tsx                        # Main dashboard — all tracks, lock/unlock, XP totals, md:grid-cols-2
│   │   ├── starter/page.tsx                # Starter track — unit map with sequential lesson unlock
│   │   ├── starter/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   │   ├── builder/page.tsx                # Builder track — unit map with sequential lesson unlock
│   │   ├── builder/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   │   ├── leveler/page.tsx                # Leveler track — unit map with sequential lesson unlock
│   │   ├── leveler/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   │   ├── wealth/page.tsx                 # Wealth Building track — unit map with sequential lesson unlock
│   │   ├── wealth/lesson/[lessonId]/page.tsx   # Dynamic lesson route using LessonPlayer
│   │   ├── options/page.tsx                # Options Trading track — unit map with sequential lesson unlock
│   │   └── options/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   ├── glossary/page.tsx                   # 60+ stock terms, searchable, filterable by category
│   ├── about/page.tsx                      # About Stockly
│   ├── contact/page.tsx                    # Contact form
│   └── settings/page.tsx                   # Name edit, plan, reset progress, sign out
│   ├── lesson/page.tsx                     # Legacy — to be replaced
│   ├── simulator/page.tsx                  # Legacy — to be redesigned
│   └── challenge/page.tsx                  # Legacy — to be redesigned
├── components/
│   ├── StocklyLogo.tsx                     # SVG S-mark logo — purple ribbon S + candlesticks
│   ├── DesktopSidebar.tsx                  # Persistent left sidebar for md+ screens — logo, nav, XP, user, sign out
│   ├── HamburgerMenu.tsx                   # Slide-in nav drawer — mobile only, dashboard only
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Badge.tsx
│   ├── XPBar.tsx
│   ├── XPPopup.tsx
│   ├── LevelUpModal.tsx
│   ├── ModuleCard.tsx
│   ├── LessonCard.tsx
│   ├── LessonPlayer.tsx                    # Lesson slide renderer — all 7 slide types, haptics, confetti
│   ├── DemoSlide.tsx                       # 8 interactive demos (see table below)
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
│   ├── haptics.ts                          # Web Vibration API utility
│   ├── celebrate.ts                        # canvas-confetti celebrations
│   ├── starter-lessons.ts                  # Starter track — 4 units, 17 lessons, shared Slide/Lesson/Unit interfaces
│   ├── builder-lessons.ts                  # Builder track — 3 units, 13 lessons
│   ├── leveler-lessons.ts                  # Leveler track — 3 units, 14 lessons
│   ├── wealth-lessons.ts                   # Wealth Building track — 3 units, 11 lessons
│   ├── options-lessons.ts                  # Options Trading track — 4 units, 20 lessons
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

## Key Architecture Decisions
- **No backend** — zero infrastructure, works offline
- **SSR-safe** — all localStorage reads inside useEffect or guarded with `typeof window !== 'undefined'`
- **Terms stored with timestamp + UUID** — `stockly_terms_agreed` provides legal proof of agreement
- **Pure functions** — `lib/gameState.ts` has zero React imports
- **Storage key versioned** — `stockgame_v1`
- **Responsive layout** — `app/layout.tsx` wraps all pages in `md:flex`; `DesktopSidebar` is `hidden md:flex` (fixed, 240px); main content is `md:ml-60`. Mobile-first, desktop-enhanced.

## Lesson System

### Shared Types (`lib/starter-lessons.ts`)
- TypeScript interfaces: `SlideType`, `QuizSlide`, `Slide`, `Lesson`, `Unit`
- `Unit` interface fields: `id`, `title`, `subtitle`, `color`, `borderColor`, `lessons[]`

### Slide Types
`'intro'` | `'text'` | `'fact'` | `'tap-reveal'` | `'quiz'` | `'complete'` | `'chart-demo'`

`chart-demo` slides reference a `demoType` string that maps to a self-contained interactive component in `DemoSlide.tsx`. Always advanceable (no gate).

### LessonPlayer Component (`components/LessonPlayer.tsx`)
- Renders all 7 slide types with animations
- Progress bar at top, haptics on every interaction
- Confetti (`celebrateCorrect()`) on correct quiz answers, shake animation on wrong
- Continue button disabled until required interaction (tap-reveal = must tap, quiz = must answer)
- Props: `lesson`, `onComplete(xp)`, `backHref`

### Interactive Demo Slides (`components/DemoSlide.tsx`)
8 self-contained interactive demos:

| demoType | Track | Lesson | What the user does |
|---|---|---|---|
| `company-split` | Starter | Pizza Shop | Order ticket — enter 5 of 100 shares, see ownership math live, review + confirm |
| `supply-demand` | Starter | Who's Buying & Selling | Add buyers/sellers, watch price direction animate |
| `savings-vs-investing` | Starter | Saving vs Investing | Drag 30-year slider, watch investing bar dwarf savings bar |
| `dca` | Starter | Starting Small | Tap to invest $50 each week, average cost calculates live |
| `price-range` | Builder | Read a Stock Page | Tap Low/Mid/High, price marker slides along 52-week range |
| `bull-bear` | Builder/Leveler | Bull vs Bear / Market Cycles | Tap through 4 market phases, SVG chart redraws |
| `portfolio-bars` | Builder | Building a Portfolio | Toggle diversification, watch risk meter change color |
| `candlestick-anatomy` | Leveler | How to Read a Price Chart | SVG candlestick with labeled arrows — tap HIGH/CLOSE/OPEN/LOW to highlight and explain each part |
| `options-chain` | Options | Reading the Options Chain | Mock options chain (5 strikes × calls/puts) — tap any row to see bid/ask/OI details and liquidity check |
| `theta-decay` | Options | Theta — Time Is Your Enemy | Animated bar chart showing time value decay from 60 DTE to 0 — advance time to watch value collapse, danger zone highlighted |

**Candlestick anatomy demo specifics** (`candlestick-anatomy`):
- Large green candlestick SVG with upper wick, body, lower wick
- Static gray labels on LEFT: "Wick" and "Body" with dashed leader lines
- Interactive labels on RIGHT: HIGH, CLOSE, OPEN, LOW with left-pointing arrowheads landing at exact candle points
- Tapping a label highlights that candle part, fades everything else, slides up an explanation card
- Caption notes this is a green candle (price went up during the period)

### Starter Track (`lib/starter-lessons.ts`)
- 4 units, 17 lessons
- Final lesson ID: `u4-l5`
- Progress key: `stockly_starter_progress` | XP key: `stockly_starter_xp`

### Builder Track (`lib/builder-lessons.ts`)
- 3 units, 13 lessons
- Final lesson ID: `b3-l5`
- Progress key: `stockly_builder_progress` | XP key: `stockly_builder_xp`

### Leveler Track (`lib/leveler-lessons.ts`)
- 3 units, 14 lessons covering: candlestick reading, support/resistance, volume, short vs long term, 1% rule, stop loss/take profit, manipulation, earnings reports, market cycles, strategy building
- Final lesson ID: `lv3-l5` — completing this unlocks Wealth Building
- Progress key: `stockly_leveler_progress` | XP key: `stockly_leveler_xp`
- Track home: `app/learn/leveler/page.tsx`
- Lesson route: `app/learn/leveler/lesson/[lessonId]/page.tsx`

### Track Page Pattern (all 3 tracks use identical structure)
- Header: StocklyLogo + wordmark (left), ✕ button routes to `/learn` (right)
- Track hero card: emoji, title, description, overall progress bar
- Unit sections with colored header cards (`color` + `borderColor` from Unit data)
- Lesson nodes: locked (🔒) / available (purple border, →) / complete (✅, green border, ★)
- Lessons unlock sequentially — previous must be complete
- Completion banner fires when all lessons done
- Content area: `max-w-sm mx-auto md:max-w-2xl`

### localStorage Keys (lesson progress)
| Key | Value |
|---|---|
| `stockly_starter_progress` | `{ [lessonId]: true }` |
| `stockly_starter_xp` | Total XP earned (number string) |
| `stockly_builder_progress` | `{ [lessonId]: true }` |
| `stockly_builder_xp` | Total XP earned (number string) |
| `stockly_leveler_progress` | `{ [lessonId]: true }` |
| `stockly_leveler_xp` | Total XP earned (number string) |
| `stockly_wealth_progress` | `{ [lessonId]: true }` |
| `stockly_wealth_xp` | Total XP earned (number string) |
| `stockly_options_progress` | `{ [lessonId]: true }` |
| `stockly_options_xp` | Total XP earned (number string) |

## Navigation System

### `/learn` Dashboard (`app/learn/page.tsx`)
- Main menu showing all 4 tracks as cards
- Lock/unlock logic:
  - Starter: always available
  - Builder: unlocks if `stockly_level` is `builder`/`leveler` OR starter final lesson (`u4-l5`) is complete
  - Leveler: unlocks if `stockly_level` is `leveler` OR builder final lesson (`b3-l5`) is complete
  - Wealth: unlocks after leveler final lesson (`lv3-l5`) is complete
  - Options: unlocks after builder final lesson (`b3-l5`) is complete
- Per-track progress bars + XP display, total XP in header
- Mobile header (hamburger + logo + XP) hidden on desktop via `md:hidden`
- Track grid: `flex flex-col md:grid md:grid-cols-2` — 2 columns on desktop
- "Coming Soon" badge for Wealth Building (not yet built)

### Desktop Sidebar (`components/DesktopSidebar.tsx`)
- `hidden md:flex` — only visible on desktop (md: and above)
- Fixed position, 240px wide (`w-60`), full height, `bg-brand-surface` with right border
- Contains: Stockly logo/wordmark (links to `/learn`), nav items, Upgrade to Pro link, total XP, user avatar + name + plan, Sign Out
- Nav items: My Tracks, Glossary, Settings, About, Contact
- Active route highlighted with purple background
- XP and user data refresh on every route change (reads localStorage on `pathname` change)

### `HamburgerMenu` Component (`components/HamburgerMenu.tsx`)
- Mobile-only, dashboard-only (not shown on track or lesson pages)
- Slide-in drawer from left, backdrop tap to close
- Same nav links as DesktopSidebar
- Sign Out at the bottom

### Track Pages (Starter, Builder, Leveler)
- No hamburger menu — focused learning experience
- Header: StocklyLogo + ✕ button that routes to `/learn`

### Supporting Pages
- `/glossary` — 60+ terms across 6 categories (Basics, Market, Trading, Analysis, Risk, Advanced). Searchable + filterable. Accordion expand. Includes "Ceiling" (resistance synonym).
- `/about` — Mission and what Stockly does
- `/contact` — Contact form + direct email (`hello@stockly.app`)
- `/settings` — Name edit, plan display, reset progress (clears all `stockly_*_progress` + `stockly_*_xp` keys), sign out

### `getResumeRoute()` (in `lib/auth.ts`)
- Enrolled users always land on `/learn` dashboard

## What To Do Next
1. **Deploy to Vercel** — app is feature-complete enough to ship
2. Wire `enrollmentComplete` flag when a track is finished
3. Redesign legacy `/simulator` + `/challenge` pages with Money Moves color system
4. Commission final bull mascot illustration

---
*Last updated: 2026-05-11 — Wealth Building track (3 units, 11 lessons) + Options Trading track (4 units, 20 lessons) built. Options chain + theta decay interactive demos added. Dashboard now shows 5 tracks with correct unlock logic.*
*To update this file: tell Claude "update CLAUDE.md" at the end of each session*
