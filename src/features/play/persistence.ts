import { saveMatchWithDetail } from '@/db/repositories/matches'
import type { Match, Round, Turn } from '@/types/domain'
import type { RoundRecord, TurnRecord } from '@/game/types'

// Convert in-memory session state into the Dexie shapes and persist.
// Returns the new match id, or null if the match had no completed rounds
// (in which case we discard — matches that didn't happen shouldn't clutter
// the history).

export async function persist121Match(input: {
  history: RoundRecord[]
  finalTarget: number
  maxDarts: number
  rounds: number | null
}): Promise<number | null> {
  if (input.history.length === 0) return null
  const match: Omit<Match, 'id'> = {
    playedAt: Date.now(),
    gameType: 'checkout121',
    finalTarget: input.finalTarget,
    maxDarts: input.maxDarts,
    rounds: input.rounds ?? undefined,
  }
  const rounds: Omit<Round, 'id' | 'matchId'>[] = input.history.map((r) => ({
    roundNumber: r.roundNumber,
    target: r.target,
    success: r.success,
    dartsUsed: r.dartsUsed,
  }))
  const turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]> = {}
  for (const r of input.history) {
    turnsByRound[r.roundNumber] = r.turns.map(turnRecordToRow)
  }
  return saveMatchWithDetail(match, rounds, turnsByRound)
}

export async function persistStandardMatch(input: {
  startScore: 501 | 301 | 201 | 101
  legsTarget: number | null
  legsWon: number
  dartsTotal: number
  threeDartAverage: number
  turns: TurnRecord[]
  completed: boolean
}): Promise<number | null> {
  if (input.legsWon === 0 && !input.completed && input.turns.length === 0) return null
  const match: Omit<Match, 'id'> = {
    playedAt: Date.now(),
    gameType: 'standardCheckout',
    startScore: input.startScore,
    legsTarget: input.legsTarget ?? undefined,
    legsWon: input.legsWon,
    finishedInDarts: input.completed ? input.dartsTotal : undefined,
    threeDartAverage: input.threeDartAverage,
  }
  // Persist a single synthetic round for the whole match; turns keep the
  // fine-grained detail. Phase 07 stats compute against the turns.
  const rounds: Omit<Round, 'id' | 'matchId'>[] = [
    {
      roundNumber: 1,
      target: input.startScore,
      success: input.completed,
      dartsUsed: input.dartsTotal,
    },
  ]
  const turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]> = {
    1: input.turns.map(turnRecordToRow),
  }
  return saveMatchWithDetail(match, rounds, turnsByRound)
}

export async function persistBarneysMatch(input: {
  totalScore: number
  perTargetHits: string[][]
}): Promise<number | null> {
  if (input.perTargetHits.length === 0) return null
  const match: Omit<Match, 'id'> = {
    playedAt: Date.now(),
    gameType: 'barneys',
    barneysScore: input.totalScore,
    barneysMaxHits: input.perTargetHits.map((hits) => hits.length),
  }
  const targets = [20, 19, 18, 17, 16, 15, 25]
  const rounds: Omit<Round, 'id' | 'matchId'>[] = input.perTargetHits.map((hits, i) => ({
    roundNumber: i + 1,
    target: targets[i] ?? 20,
    success: hits.length > 0,
    dartsUsed: hits.length,
  }))
  return saveMatchWithDetail(match, rounds, {})
}

function turnRecordToRow(t: TurnRecord): Omit<Turn, 'id' | 'roundId'> {
  return {
    turnNumber: t.turnNumber,
    dartsThrown: t.dartsThrown,
    scoreThrown: t.scoreThrown,
    remainingAfter: t.remainingAfter,
    isBust: t.isBust,
  }
}
