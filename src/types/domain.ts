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
