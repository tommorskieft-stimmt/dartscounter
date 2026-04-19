import { saveMatchWithDetail, countMatches, clearAllMatches } from '@/db/repositories/matches'
import type { GameType, Match, Round, Turn } from '@/types/domain'

// Deterministic-ish demo data so the Stats screen has something to render
// in dev. Invoke from the browser devtools: `await window.__seedDemo()`.
// In production builds this module is never imported, so the helper is
// dev-only by construction (see main.ts wiring).

const rand = mulberry32(20260419)

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(xs: readonly T[]): T {
  return xs[Math.floor(rand() * xs.length)]!
}

function fake121Match(playedAt: number): {
  match: Omit<Match, 'id'>
  rounds: Omit<Round, 'id' | 'matchId'>[]
  turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]>
} {
  const rounds = 10
  const maxDarts = 9
  let target = 121
  const roundRows: Omit<Round, 'id' | 'matchId'>[] = []
  const turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]> = {}
  for (let r = 1; r <= rounds; r += 1) {
    const success = rand() > 0.45
    const dartsUsed = success ? 3 + Math.floor(rand() * 6) : maxDarts
    roundRows.push({ roundNumber: r, target, success, dartsUsed })
    turnsByRound[r] = fakeTurnsTowardTarget(target, dartsUsed, success)
    target = success ? target + 1 : Math.max(target - 1, 121)
  }
  return {
    match: {
      playedAt,
      gameType: 'checkout121',
      finalTarget: target,
      maxDarts,
      rounds,
    },
    rounds: roundRows,
    turnsByRound,
  }
}

function fakeTurnsTowardTarget(
  target: number,
  dartsUsed: number,
  success: boolean,
): Omit<Turn, 'id' | 'roundId'>[] {
  const turns: Omit<Turn, 'id' | 'roundId'>[] = []
  let remaining = target
  let dartsLeft = dartsUsed
  let turnNumber = 1
  while (dartsLeft > 0) {
    const thisTurnDarts = Math.min(3, dartsLeft) as 1 | 2 | 3
    dartsLeft -= thisTurnDarts
    const targetFinish = success && dartsLeft === 0
    const maxThrown = Math.min(thisTurnDarts * 60, remaining - (targetFinish ? 0 : 2))
    const scoreThrown = targetFinish
      ? remaining
      : Math.floor(rand() * Math.max(20, maxThrown))
    remaining -= scoreThrown
    turns.push({
      turnNumber,
      dartsThrown: thisTurnDarts,
      scoreThrown,
      remainingAfter: Math.max(0, remaining),
      isBust: false,
    })
    turnNumber += 1
    if (remaining <= 0) break
  }
  return turns
}

function fake501Match(playedAt: number): {
  match: Omit<Match, 'id'>
  rounds: Omit<Round, 'id' | 'matchId'>[]
  turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]>
} {
  const start = pick([501, 501, 501, 301] as const)
  const darts = start === 501 ? 18 + Math.floor(rand() * 12) : 12 + Math.floor(rand() * 8)
  const threeDartAverage = (start / darts) * 3
  return {
    match: {
      playedAt,
      gameType: 'standardCheckout',
      startScore: start,
      legsTarget: 1,
      legsWon: 1,
      finishedInDarts: darts,
      threeDartAverage,
    },
    rounds: [{ roundNumber: 1, target: start, success: true, dartsUsed: darts }],
    turnsByRound: { 1: [] },
  }
}

function fakeBarneysMatch(playedAt: number): {
  match: Omit<Match, 'id'>
  rounds: Omit<Round, 'id' | 'matchId'>[]
  turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]>
} {
  const perTarget = Array.from({ length: 7 }).map(() => Math.floor(rand() * 4))
  const total = perTarget.reduce((a, b) => a + b * (1 + Math.floor(rand() * 2)), 0)
  return {
    match: {
      playedAt,
      gameType: 'barneys',
      barneysScore: total,
      barneysMaxHits: perTarget,
    },
    rounds: perTarget.map((hits, i) => ({
      roundNumber: i + 1,
      target: [20, 19, 18, 17, 16, 15, 25][i] ?? 20,
      success: hits > 0,
      dartsUsed: 3,
    })),
    turnsByRound: {},
  }
}

const BUILDERS: Record<
  GameType,
  (playedAt: number) => ReturnType<typeof fake121Match>
> = {
  checkout121: fake121Match,
  standardCheckout: fake501Match,
  barneys: fakeBarneysMatch,
}

export async function seedDemoMatches(count = 30, reset = false): Promise<number> {
  if (reset) await clearAllMatches()
  const now = Date.now()
  const dayMs = 24 * 3600 * 1000
  for (let i = 0; i < count; i += 1) {
    const type = pick<GameType>(['checkout121', 'standardCheckout', 'barneys'])
    const playedAt = now - i * dayMs - Math.floor(rand() * dayMs)
    const fake = BUILDERS[type](playedAt)
    await saveMatchWithDetail(fake.match, fake.rounds, fake.turnsByRound)
  }
  return countMatches()
}
