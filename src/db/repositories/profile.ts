import { db } from '@/db/database'
import type { Profile } from '@/types/domain'

// Profile is a singleton — we always operate on id: 1.
const ID = 1 as const

export async function loadProfile(): Promise<Profile | undefined> {
  return db.profiles.get(ID)
}

export async function saveProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
  const row: Profile = { id: ID, ...profile }
  await db.profiles.put(row)
  return row
}

export async function clearProfile(): Promise<void> {
  await db.profiles.delete(ID)
}
