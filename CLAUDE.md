# Stockly — Gamified Stock Learning App

## Project Origin
Originally built as "StockQuest" in a single Claude Code session. Rebranded and redesigned as **Stockly** starting 2026-04-22. The vision is a Duolingo-style stock education platform built for people who were never given access to financial education — especially women, young adults, and first-gen wealth builders.

## What This App Is
A mobile-first, beginner-friendly stock education app. Bright, interactive, and welcoming — feels like playing, not studying. Full 14-screen onboarding flow routes users into a personalized learning track. All state stored in localStorage, no backend required.

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

### Starter Track (9 lessons — placeholder page exists, content not yet built)
1. What is a stock, really?
2. What is the stock market and who's actually in it?
3. Why do stock prices go up and down?
4. What is a broker and how do you actually buy a stock?
5. What is a portfolio?
6. The difference between saving money and investing money
7. Why people are scared of investing — and why that makes sense
8. What is risk and how do you think about it?
9. Your first goal: what does "starting small" actually look like?

### Builder Track (10 lessons — placeholder page exists, content not yet built)
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

### Leveler Track (10 lessons — placeholder page exists, content not yet built)
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

### Wealth Building Closer (6 lessons — not yet built, unlocks after all tracks)
1. The difference between an asset and a liability
2. How the wealthy use the stock market as a tool, not a gamble
3. Saving with purpose — emergency fund, investment fund, spending money
4. Compound interest — why starting early beats starting big
5. Generational wealth — what it is and how regular people build it
6. Your next step — you have the knowledge, now build the habit

## Project Structure
```
stock-game/
├── app/
│   ├── layout.tsx                          # Root layout — brand-black bg, no XPBar on onboarding
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
│   │   ├── page.tsx                        # Main dashboard — all tracks, lock/unlock, XP totals
│   │   ├── starter/page.tsx                # Starter track — unit map with sequential lesson unlock
│   │   ├── starter/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   │   ├── builder/page.tsx                # Builder track — unit map with sequential lesson unlock
│   │   ├── builder/lesson/[lessonId]/page.tsx  # Dynamic lesson route using LessonPlayer
│   │   └── leveler/page.tsx                # Leveler track (placeholder)
│   ├── glossary/page.tsx                   # 60+ stock terms, searchable, filterable by category
│   ├── about/page.tsx                      # About Stockly
│   ├── contact/page.tsx                    # Contact form
│   └── settings/page.tsx                   # Name edit, plan, reset progress, sign out
│   ├── lesson/page.tsx                     # Legacy — to be replaced
│   ├── simulator/page.tsx                  # Legacy — to be redesigned
│   └── challenge/page.tsx                  # Legacy — to be redesigned
├── components/
│   ├── StocklyLogo.tsx                     # SVG S-mark logo — purple ribbon S + candlesticks
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
│   ├── LessonPlayer.tsx                    # Lesson slide renderer — all 6 slide types, haptics, confetti
│   ├── HamburgerMenu.tsx                   # Slide-in nav drawer — all main navigation links
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
│   ├── starter-lessons.ts                  # All Starter track lesson data — 4 units, 17 lessons
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

## Lesson System — Starter Track (BUILT)

### Data (`lib/starter-lessons.ts`)
- TypeScript interfaces: `SlideType`, `QuizSlide`, `Slide`, `Lesson`, `Unit`
- `STARTER_UNITS` array — 4 units, 17 lessons, fully written educational content
- Unit 1: What is a Stock? (pizza shop analogy, real ownership, IPOs, unit quiz)
- Unit 2: How the Market Works (NYSE/Nasdaq, buyers/sellers, price movement, unit quiz)
- Unit 3: Getting Started (brokers, SIPC protection, how to buy, portfolios, ETFs, unit quiz)
- Unit 4: Money & Risk (saving vs investing, inflation, fear/crashes, 1-2% rule, DCA, fractional shares, final quiz)

### Slide Types
`'intro'` | `'text'` | `'fact'` | `'tap-reveal'` | `'quiz'` | `'complete'`

### LessonPlayer Component (`components/LessonPlayer.tsx`)
- Renders all 6 slide types with animations
- Progress bar at top, haptics on every interaction
- Confetti (`celebrateCorrect()`) on correct quiz answers, shake animation on wrong
- Continue button disabled until required interaction (tap-reveal = must tap, quiz = must answer)
- Props: `lesson`, `onComplete(xp)`, `backHref`

### Starter Track Home (`app/learn/starter/page.tsx`)
- Shows all 4 units with colored section headers
- Lesson nodes: locked (🔒) → available → complete (✅)
- Lessons unlock sequentially — complete one to unlock the next
- Overall progress bar with % complete + lesson count
- Progress stored in `stockly_starter_progress` (localStorage)

### Lesson Route (`app/learn/starter/lesson/[lessonId]/page.tsx`)
- Dynamic route — looks up lesson by ID from `STARTER_UNITS`
- On complete: saves to `stockly_starter_progress`, adds XP to `stockly_starter_xp`
- Milestone celebration at 100 XP (haptics.levelUp + celebrateLevelUp)
- Routes back to `/learn/starter` on completion

### localStorage Keys (lesson progress)
| Key | Value |
|---|---|
| `stockly_starter_progress` | `{ [lessonId]: true }` — which lessons are complete |
| `stockly_starter_xp` | Total XP earned in starter track (number string) |

## Navigation System (BUILT)

### `/learn` Dashboard (`app/learn/page.tsx`)
- Main menu showing all 4 tracks as cards: Starter, Builder, Leveler, Wealth Building
- Lock/unlock logic:
  - Starter: always available
  - Builder: unlocks if `stockly_level` is `builder`/`leveler` OR starter final lesson (`u4-l5`) is complete
  - Leveler: unlocks if `stockly_level` is `leveler` OR builder final lesson (`b3-l5`) is complete
  - Wealth: unlocks after leveler final lesson (`lv3-l5`) is complete
- Per-track progress bars + XP display, total XP in header
- "Coming Soon" badge for tracks not yet built

### `HamburgerMenu` Component (`components/HamburgerMenu.tsx`)
- Slide-in drawer from left, backdrop tap to close
- Shows user name + Free/Pro plan badge
- Links: My Tracks → `/learn`, Upgrade to Pro → `/onboarding/plan`, Glossary → `/glossary`, Settings → `/settings`, About → `/about`, Contact → `/contact`
- Sign Out at the bottom (calls `signOut()`, routes to `/`)

### Supporting Pages
- `/glossary` — 60+ terms across 6 categories (Basics, Market, Trading, Analysis, Risk, Advanced). Searchable + filterable by category. Accordion expand.
- `/about` — Mission and what Stockly does
- `/contact` — Contact form + direct email
- `/settings` — Name edit, plan display, reset progress, sign out

### `getResumeRoute()` updated
- Enrolled users now always land on `/learn` dashboard instead of a specific track

### Track ✕ buttons
- Both Starter and Builder track home pages now route ✕ → `/learn`

## What To Do Next
1. Build Leveler track lesson content + routes (same pattern as Starter/Builder)
2. Build Wealth Building closer track (unlocks after Leveler)
3. Wire `enrollmentComplete` flag after all lessons in a track are done
4. Redesign legacy simulator + challenge pages with Money Moves color system
5. Commission final bull mascot illustration
6. Deploy to Vercel

---
*Last updated: 2026-05-08 — Builder track built (13 lessons), /learn dashboard, HamburgerMenu with full nav, Glossary (60+ terms), About/Contact/Settings pages, getResumeRoute updated to land on /learn*
*To update this file: tell Claude "update CLAUDE.md" at the end of each session*
