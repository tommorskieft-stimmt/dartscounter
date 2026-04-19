// Canonical domain types shared between Dexie, stores, and views.
// Kept framework-agnostic so game engines can depend on them freely.

export type PlayerLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export const PLAYER_LEVELS: readonly PlayerLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
] as const

export interface Profile {
  /** Singleton row — always id === 1. */
  id: 1
  firstName: string
  lastName: string
  /** ISO yyyy-mm-dd. Optional. */
  birthday?: string
  level: PlayerLevel
  soundsEnabled: boolean
  /** Unix ms. */
  createdAt: number
}

export type ProfileDraft = Omit<Profile, 'id' | 'createdAt' | 'soundsEnabled'> & {
  soundsEnabled?: boolean
}

// -----------------------------------------------------------------------
// Matches
// -----------------------------------------------------------------------

export type GameType = 'checkout121' | 'standardCheckout' | 'barneys'

/**
 * Any positive integer is a valid starting score — we ship 501 / 301 /
 * 201 as presets and let the user enter any other value via the custom
 * field. Kept as a bare `number` so persisted data doesn't lose info.
 */
export type StandardStartScore = number

export interface Match {
  /** Auto-incremented by Dexie. */
  id?: number
  playedAt: number
  gameType: GameType

  // ---- 121 Checkout fields ----
  finalTarget?: number
  maxDarts?: number
  /** null-ish stored as undefined; Infinity not serialisable. */
  rounds?: number

  // ---- Standard Checkout fields ----
  startScore?: StandardStartScore
  legsTarget?: number
  legsWon?: number
  finishedInDarts?: number
  threeDartAverage?: number

  // ---- Barney's Drill fields ----
  barneysScore?: number
  barneysMaxHits?: number[]
}

export interface Round {
  id?: number
  matchId: number
  roundNumber: number
  target: number
  success: boolean
  dartsUsed: number
}

/** Optional per-dart breakdown — enables the segment heatmap (phase 07+). */
export interface DartDetail {
  /** 1..20 or 25 (single bull). */
  value: number
  /** 1 single, 2 double, 3 treble. */
  multiplier: 1 | 2 | 3
}

export interface Turn {
  id?: number
  roundId: number
  turnNumber: number
  dartsThrown: 1 | 2 | 3
  scoreThrown: number
  remainingAfter: number
  isBust: boolean
  dartsDetail?: DartDetail[]
}

// -----------------------------------------------------------------------
// Computed, non-persisted shapes used by the Stats screen
// -----------------------------------------------------------------------

export interface MatchDetail {
  match: Match
  rounds: Round[]
  turns: Turn[]
}
