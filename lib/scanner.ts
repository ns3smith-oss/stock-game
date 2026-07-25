// Daily-bar flag-pattern detector.
// Flag setup = a sharp, high-volume "pole" move followed by a tight, lower-volume
// consolidation ("flag") that hasn't given back most of the pole's gain.
// Runs on daily bars (not intraday) because the current Polygon plan only allows
// end-of-day data — see CLAUDE.md "Scanner" section for the plan tradeoff.

export interface DailyBar {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface FlagMatch {
  poleStartDate: string
  poleEndDate: string
  poleGainPct: number
  poleRelVol: number
  flagStartDate: string
  flagDays: number
  flagRangePct: number
  retracePct: number
  volumeTrend: 'declining' | 'flat' | 'rising'
  confidence: number
}

// ─── Tunable thresholds ────────────────────────────────────────────────
const MIN_POLE_GAIN_PCT = 15       // pole must gain at least this much
const MIN_POLE_REL_VOL = 2         // pole volume vs baseline average
const MAX_POLE_LEN = 5             // pole can span up to this many days
const MIN_FLAG_DAYS = 1
const MAX_FLAG_DAYS = 8
const MAX_RETRACE_PCT = 50         // flag can't give back more than this % of the pole
const MAX_FLAG_RANGE_PCT = 20      // flag high-low range vs pole high, tightness cap
const BASELINE_WINDOW = 10         // days used to compute "normal" volume before the pole

function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export interface HistoricalFlag extends FlagMatch {
  flagEndDate: string
  outcomeLabel: 'breakout' | 'failed' | 'neutral'
  outcomePct: number | null  // % move in 5 days after flag end; null if no bars after
}

// Find all non-overlapping flag patterns in a full bar history.
// Slides a window forward, skipping past each found pattern to avoid duplicates.
// Bars after the flag end are used to classify the outcome.
export function findAllFlags(bars: DailyBar[], minConfidence = 55): HistoricalFlag[] {
  const results: HistoricalFlag[] = []
  let startFrom = 0

  while (startFrom < bars.length) {
    // We need at least BASELINE_WINDOW + MAX_POLE_LEN + MIN_FLAG_DAYS bars to detect anything
    const minLen = BASELINE_WINDOW + MAX_POLE_LEN + MIN_FLAG_DAYS
    // Try windows of 15–35 bars ending at each possible position
    let foundAt = -1
    let bestMatch: FlagMatch | null = null
    let bestWindowEnd = -1

    for (let end = startFrom + minLen; end <= bars.length; end++) {
      const slice = bars.slice(startFrom, end)
      // Only run detectFlag on windows that end in a valid flag range
      // (don't let the window grow too large — cap at BASELINE_WINDOW + MAX_POLE_LEN + MAX_FLAG_DAYS + 2)
      if (slice.length > BASELINE_WINDOW + MAX_POLE_LEN + MAX_FLAG_DAYS + 2) break
      const m = detectFlag(slice)
      if (m && m.confidence >= minConfidence) {
        if (!bestMatch || m.confidence > bestMatch.confidence) {
          bestMatch = m
          bestWindowEnd = end
          foundAt = startFrom
        }
      }
    }

    if (!bestMatch || bestWindowEnd === -1) {
      startFrom++
      continue
    }

    // flag ends at bestWindowEnd - 1 (last bar of the slice)
    const flagEndIdx = bestWindowEnd - 1
    const flagEndBar = bars[flagEndIdx]

    // Look ahead 5 bars to classify outcome
    const lookAhead = bars.slice(flagEndIdx + 1, flagEndIdx + 6)
    let outcomePct: number | null = null
    let outcomeLabel: HistoricalFlag['outcomeLabel'] = 'neutral'

    if (lookAhead.length > 0) {
      const entryPrice = flagEndBar.close
      const highAfter  = Math.max(...lookAhead.map(b => b.high))
      const lowAfter   = Math.min(...lookAhead.map(b => b.low))
      const upMove   = ((highAfter  - entryPrice) / entryPrice) * 100
      const downMove = ((lowAfter   - entryPrice) / entryPrice) * 100
      // Classify: whichever direction hit ≥5% first wins; if neither, neutral
      if (upMove >= 5 && Math.abs(downMove) < 5) {
        outcomeLabel = 'breakout'
        outcomePct = upMove
      } else if (Math.abs(downMove) >= 5 && upMove < 5) {
        outcomeLabel = 'failed'
        outcomePct = downMove
      } else {
        outcomePct = ((lookAhead[lookAhead.length - 1].close - entryPrice) / entryPrice) * 100
      }
    }

    results.push({ ...bestMatch, flagEndDate: flagEndBar.date, outcomeLabel, outcomePct })

    // Skip past this pattern to avoid overlapping detections
    startFrom = flagEndIdx + 1
  }

  return results
}

export function detectFlag(bars: DailyBar[]): FlagMatch | null {
  const n = bars.length
  if (n < BASELINE_WINDOW + MAX_POLE_LEN + MIN_FLAG_DAYS) return null

  let best: FlagMatch | null = null

  // pEnd = index of the last day of the pole. Must leave room for a flag after it.
  for (let pEnd = n - 1 - MIN_FLAG_DAYS; pEnd >= BASELINE_WINDOW; pEnd--) {
    const flagDays = n - 1 - pEnd
    if (flagDays < MIN_FLAG_DAYS || flagDays > MAX_FLAG_DAYS) continue

    for (let poleLen = 1; poleLen <= MAX_POLE_LEN; poleLen++) {
      const pStart = pEnd - poleLen + 1
      if (pStart < BASELINE_WINDOW) continue

      const poleBars = bars.slice(pStart, pEnd + 1)
      const baselineBars = bars.slice(pStart - BASELINE_WINDOW, pStart)

      const poleGainPct = ((poleBars[poleBars.length - 1].close - poleBars[0].open) / poleBars[0].open) * 100
      if (poleGainPct < MIN_POLE_GAIN_PCT) continue

      const baselineAvgVol = avg(baselineBars.map((b) => b.volume))
      const poleMaxVol = Math.max(...poleBars.map((b) => b.volume))
      const poleRelVol = baselineAvgVol > 0 ? poleMaxVol / baselineAvgVol : 0
      if (poleRelVol < MIN_POLE_REL_VOL) continue

      const poleHigh = Math.max(...poleBars.map((b) => b.high))
      const poleLow = Math.min(...poleBars.map((b) => b.low))

      const flagBars = bars.slice(pEnd + 1, n)
      const flagHigh = Math.max(...flagBars.map((b) => b.high))
      const flagLow = Math.min(...flagBars.map((b) => b.low))

      if (flagLow <= poleLow) continue // gave back the entire pole — not a flag anymore

      const retracePct = ((poleHigh - flagLow) / (poleHigh - poleLow)) * 100
      if (retracePct > MAX_RETRACE_PCT) continue

      const flagRangePct = ((flagHigh - flagLow) / poleHigh) * 100
      if (flagRangePct > MAX_FLAG_RANGE_PCT) continue

      const flagAvgVol = avg(flagBars.map((b) => b.volume))
      const volRatio = poleMaxVol > 0 ? flagAvgVol / poleMaxVol : 1
      const volumeTrend: FlagMatch['volumeTrend'] =
        volRatio < 0.6 ? 'declining' : volRatio > 0.9 ? 'rising' : 'flat'

      // Pattern is "broken" if the last close is sitting at the bottom of the flag range
      const lastClose = flagBars[flagBars.length - 1].close
      const flagRange = flagHigh - flagLow || 1
      const positionInRange = (lastClose - flagLow) / flagRange
      if (positionInRange < 0.15) continue

      const confidence = Math.max(0, Math.min(100,
        25 * Math.min(poleGainPct / 30, 1) +
        20 * Math.min(poleRelVol / 4, 1) +
        25 * (1 - flagRangePct / MAX_FLAG_RANGE_PCT) +
        15 * (1 - retracePct / MAX_RETRACE_PCT) +
        15 * (volumeTrend === 'declining' ? 1 : volumeTrend === 'flat' ? 0.5 : 0)
      ))

      if (!best || confidence > best.confidence) {
        best = {
          poleStartDate: poleBars[0].date,
          poleEndDate: poleBars[poleBars.length - 1].date,
          poleGainPct,
          poleRelVol,
          flagStartDate: flagBars[0].date,
          flagDays,
          flagRangePct,
          retracePct,
          volumeTrend,
          confidence,
        }
      }
    }
  }

  return best
}
