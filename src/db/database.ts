import Dexie, { type EntityTable } from 'dexie'
import type { Match, Profile, Round, Turn } from '@/types/domain'

// IndexedDB schema. Versioning rules for this project:
//   - Schema changes are additive; existing data is preserved.
//   - Bump the `version()` number and add a new block; never mutate an
//     earlier one.
//   - Breaking changes require a migration plan in docs/plans/.
//
// v1 (phase 02): profiles singleton
// v2 (phase 03): matches, rounds, turns
export class OneTwoOneDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  matches!: EntityTable<Match, 'id'>
  rounds!: EntityTable<Round, 'id'>
  turns!: EntityTable<Turn, 'id'>

  constructor() {
    super('OneTwoOneDB')
    this.version(1).stores({
      profiles: 'id',
    })
    this.version(2).stores({
      profiles: 'id',
      matches: '++id, playedAt, gameType, [gameType+playedAt]',
      rounds: '++id, matchId, [matchId+roundNumber]',
      turns: '++id, roundId, [roundId+turnNumber]',
    })
  }
}

export const db = new OneTwoOneDB()
