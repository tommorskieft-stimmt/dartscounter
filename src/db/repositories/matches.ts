import { db } from '@/db/database'
import type { GameType, Match, MatchDetail, Round, Turn } from '@/types/domain'

// Matches / rounds / turns are always written together — one transaction
// preserves referential integrity and lets Dexie recover cleanly on
// partial failures (e.g. tab closed mid-write).
export async function saveMatchWithDetail(
  matchInput: Omit<Match, 'id'>,
  roundsInput: Omit<Round, 'id' | 'matchId'>[],
  turnsByRound: Record<number, Omit<Turn, 'id' | 'roundId'>[]>,
): Promise<number> {
  return db.transaction('rw', db.matches, db.rounds, db.turns, async () => {
    const matchId = await db.matches.add(matchInput as Match)
    for (const roundInput of roundsInput) {
      const roundId = await db.rounds.add({ ...roundInput, matchId } as Round)
      const turns = turnsByRound[roundInput.roundNumber] ?? []
      for (const turnInput of turns) {
        await db.turns.add({ ...turnInput, roundId } as Turn)
      }
    }
    return Number(matchId)
  })
}

export async function listRecentMatches(limit = 50): Promise<Match[]> {
  return db.matches.orderBy('playedAt').reverse().limit(limit).toArray()
}

export async function listMatchesByType(type: GameType, limit = 100): Promise<Match[]> {
  return db.matches
    .where('[gameType+playedAt]')
    .between([type, 0], [type, Number.MAX_SAFE_INTEGER])
    .reverse()
    .limit(limit)
    .toArray()
}

export async function getMatchDetail(matchId: number): Promise<MatchDetail | undefined> {
  const match = await db.matches.get(matchId)
  if (!match) return undefined
  const rounds = await db.rounds
    .where('matchId')
    .equals(matchId)
    .sortBy('roundNumber')
  const allTurns = await db.turns
    .where('roundId')
    .anyOf(rounds.map((r) => r.id!).filter((x): x is number => typeof x === 'number'))
    .toArray()
  allTurns.sort((a, b) => a.turnNumber - b.turnNumber)
  return { match, rounds, turns: allTurns }
}

export async function deleteMatch(matchId: number): Promise<void> {
  await db.transaction('rw', db.matches, db.rounds, db.turns, async () => {
    const rounds = await db.rounds.where('matchId').equals(matchId).toArray()
    const roundIds = rounds.map((r) => r.id!).filter((x): x is number => typeof x === 'number')
    if (roundIds.length) {
      await db.turns.where('roundId').anyOf(roundIds).delete()
    }
    await db.rounds.where('matchId').equals(matchId).delete()
    await db.matches.delete(matchId)
  })
}

export async function clearAllMatches(): Promise<void> {
  await db.transaction('rw', db.matches, db.rounds, db.turns, async () => {
    await db.turns.clear()
    await db.rounds.clear()
    await db.matches.clear()
  })
}

export async function countMatches(): Promise<number> {
  return db.matches.count()
}
