import Dexie, { type EntityTable } from 'dexie'
import type { Profile } from '@/types/domain'

// IndexedDB schema — v1 ships the Profile singleton. Match / Round / Turn
// tables land in phase 03. Stick to additive schema changes only.
export class OneTwoOneDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>

  constructor() {
    super('OneTwoOneDB')
    this.version(1).stores({
      // Primary key only for the singleton; no index columns needed.
      profiles: 'id',
    })
  }
}

export const db = new OneTwoOneDB()
