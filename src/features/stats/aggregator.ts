import type { GameType, Match, MatchDetail } from '@/types/domain'
import { db } from '@/db/database'

// All stat shapes computed here are *performance* analytics — how the
// player has played over time. No web / user-behaviour tracking lives in
// this app (confirmed with Tom). Reads all match data from Dexie on
// demand; everything is computed in one pass per view.

export interface OverallStats {
  matches: number
  rounds: number
  checkouts: number
  checkoutRate: number
  highestOut: number | null
  fewestDarts: number | null
  bestStreak: number
  totalDarts: number
  perType: Record<GameType, number>
}

export interface Checkout121Stats {
  matches: number
  finalTargets: number[]
  highestTarget: number
  averageTargetReached: number
  checkoutsByRange: Array<{ label: string; rate: number; count: number }>
  trend: Array<{ playedAt: number; checkoutRate: number }>
}

export interface StandardStats {
  matches: number
  legsWon: number
  bestAverage: number
  rollingAverage: number // last 10 matches
  firstNineAverage: number | null
  oneEighties: number
  tons: number // 100+
  forties: number // 140+
  sixties: number // 60+
  busts: number
  trend: Array<{ playedAt: number; average: number }>
}

export interface BarneysStats {
  matches: number
  bestScore: number
  averageScore: number
  perTarget: Array<{ target: number | 'Bull'; attempts: number; points: number; maxPoints: number }>
  trend: Array<{ playedAt: number; score: number }>
}

const BARNEYS_TARGET_LABELS: readonly (number | 'Bull')[] = [20, 19, 18, 17, 16, 15, 'Bull']

export async function computeOverallStats(): Promise<OverallStats> {
  const matches = await db.matches.toArray()
  const rounds = await db.rounds.toArray()
  const turns = await db.turns.toArray()

  const successes = rounds.filter((r) => r.success)
  const highestOut = successes.length
    ? Math.max(...successes.filter((r) => r.target > 0).map((r) => r.target))
    : null
  const fewestDarts = successes.length ? Math.min(...successes.map((r) => r.dartsUsed)) : null

  const orderedRounds = [...rounds].sort((a, b) => {
    const at = matches.find((m) => m.id === a.matchId)?.playedAt ?? 0
    const bt = matches.find((m) => m.id === b.matchId)?.playedAt ?? 0
    if (at !== bt) return at - bt
    return a.roundNumber - b.roundNumber
  })
  let bestStreak = 0
  let cur = 0
  for (const r of orderedRounds) {
    if (r.success) {
      cur += 1
      if (cur > bestStreak) bestStreak = cur
    } else {
      cur = 0
    }
  }

  const totalDarts = turns.reduce((a, t) => a + t.dartsThrown, 0)

  const perType: Record<GameType, number> = {
    checkout121: 0,
    standardCheckout: 0,
    barneys: 0,
  }
  for (const m of matches) perType[m.gameType] += 1

  return {
    matches: matches.length,
    rounds: rounds.length,
    checkouts: successes.length,
    checkoutRate: rounds.length === 0 ? 0 : Math.round((successes.length / rounds.length) * 100),
    highestOut,
    fewestDarts,
    bestStreak,
    totalDarts,
    perType,
  }
}

export async function computeCheckout121Stats(): Promise<Checkout121Stats> {
  const matches = await db.matches.where('gameType').equals('checkout121').toArray()
  matches.sort((a, b) => a.playedAt - b.playedAt)
  const matchIds = matches.map((m) => m.id!).filter((x): x is number => typeof x === 'number')
  const rounds = matchIds.length
    ? await db.rounds.where('matchId').anyOf(matchIds).toArray()
    : []

  const finalTargets = matches.map((m) => m.finalTarget ?? 121)
  const highestTarget = finalTargets.length ? Math.max(...finalTargets) : 121
  const averageTargetReached = finalTargets.length
    ? finalTargets.reduce((a, b) => a + b, 0) / finalTargets.length
    : 121

  const ranges: Array<{ label: string; min: number; max: number }> = [
    { label: '121-130', min: 121, max: 130 },
    { label: '131-150', min: 131, max: 150 },
    { label: '151+', min: 151, max: Number.POSITIVE_INFINITY },
  ]
  const checkoutsByRange = ranges.map(({ label, min, max }) => {
    const inRange = rounds.filter((r) => r.target >= min && r.target <= max)
    const hit = inRange.filter((r) => r.success).length
    return {
      label,
      rate: inRange.length === 0 ? 0 : Math.round((hit / inRange.length) * 100),
      count: inRange.length,
    }
  })

  const trend = matches.map((m) => {
    const rs = rounds.filter((r) => r.matchId === m.id)
    const success = rs.filter((r) => r.success).length
    return {
      playedAt: m.playedAt,
      checkoutRate: rs.length === 0 ? 0 : Math.round((success / rs.length) * 100),
    }
  })

  return {
    matches: matches.length,
    finalTargets,
    highestTarget,
    averageTargetReached,
    checkoutsByRange,
    trend,
  }
}

export async function computeStandardStats(): Promise<StandardStats> {
  const matches = await db.matches
    .where('gameType')
    .equals('standardCheckout')
    .toArray()
  matches.sort((a, b) => a.playedAt - b.playedAt)
  const matchIds = matches.map((m) => m.id!).filter((x): x is number => typeof x === 'number')
  const turns = matchIds.length
    ? await (async () => {
        const rounds = await db.rounds.where('matchId').anyOf(matchIds).toArray()
        const roundIds = rounds.map((r) => r.id!).filter((x): x is number => typeof x === 'number')
        if (roundIds.length === 0) return []
        return db.turns.where('roundId').anyOf(roundIds).toArray()
      })()
    : []

  const legsWon = matches.reduce((a, m) => a + (m.legsWon ?? 0), 0)
  const averages = matches.map((m) => m.threeDartAverage ?? 0)
  const bestAverage = averages.length ? Math.max(...averages) : 0
  const rollingAverage = averages.length
    ? averages.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, averages.length)
    : 0

  const oneEighties = turns.filter((t) => t.scoreThrown === 180).length
  const tons = turns.filter((t) => t.scoreThrown >= 100 && t.scoreThrown < 140).length
  const forties = turns.filter((t) => t.scoreThrown >= 140 && t.scoreThrown < 180).length
  const sixties = turns.filter((t) => t.scoreThrown >= 60 && t.scoreThrown < 100).length
  const busts = turns.filter((t) => t.isBust).length

  const trend = matches.map((m) => ({
    playedAt: m.playedAt,
    average: m.threeDartAverage ?? 0,
  }))

  return {
    matches: matches.length,
    legsWon,
    bestAverage,
    rollingAverage,
    firstNineAverage: null,
    oneEighties,
    tons,
    forties,
    sixties,
    busts,
    trend,
  }
}

export async function computeBarneysStats(): Promise<BarneysStats> {
  const matches = await db.matches.where('gameType').equals('barneys').toArray()
  matches.sort((a, b) => a.playedAt - b.playedAt)

  const scores = matches.map((m) => m.barneysScore ?? 0)
  const bestScore = scores.length ? Math.max(...scores) : 0
  const averageScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  const perTarget = BARNEYS_TARGET_LABELS.map((target, i) => {
    let attempts = 0
    let points = 0
    let maxPoints = 0
    for (const m of matches) {
      const hits = m.barneysMaxHits ?? []
      const h = hits[i] ?? 0
      if (h > 0) {
        attempts += h
        points += 0 // per-dart detail isn't persisted yet; show attempts-only for now
      }
      maxPoints += 9
    }
    return { target, attempts, points, maxPoints }
  })

  const trend = matches.map((m) => ({ playedAt: m.playedAt, score: m.barneysScore ?? 0 }))

  return {
    matches: matches.length,
    bestScore,
    averageScore,
    perTarget,
    trend,
  }
}

export interface AllStats {
  overall: OverallStats
  checkout121: Checkout121Stats
  standard: StandardStats
  barneys: BarneysStats
}

export async function computeAllStats(): Promise<AllStats> {
  const [overall, checkout121, standard, barneys] = await Promise.all([
    computeOverallStats(),
    computeCheckout121Stats(),
    computeStandardStats(),
    computeBarneysStats(),
  ])
  return { overall, checkout121, standard, barneys }
}

// Convenience: return matches touched in the last N days.
export function matchesSince(matches: Match[], days: number): Match[] {
  const threshold = Date.now() - days * 24 * 3600 * 1000
  return matches.filter((m) => m.playedAt >= threshold)
}

// Convenience: derived via MatchDetail.
export function scoredInMatch(detail: MatchDetail): number {
  return detail.turns.reduce((a, t) => (t.isBust ? a : a + t.scoreThrown), 0)
}
