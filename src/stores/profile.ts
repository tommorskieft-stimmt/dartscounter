import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PlayerLevel, Profile } from '@/types/domain'
import { clearProfile, loadProfile, saveProfile } from '@/db/repositories/profile'

// Reactive Profile singleton backed by Dexie. Views call `load()` once on
// mount; mutations go through `save()` which persists and refreshes state.
export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const loaded = ref(false)

  const isOnboarded = computed(() => profile.value !== null)

  async function load() {
    const row = await loadProfile()
    profile.value = row ?? null
    loaded.value = true
  }

  async function save(input: {
    firstName: string
    lastName: string
    birthday?: string
    level: PlayerLevel
    soundsEnabled?: boolean
  }) {
    const existing = profile.value
    const next: Omit<Profile, 'id'> = {
      firstName: input.firstName,
      lastName: input.lastName,
      birthday: input.birthday,
      level: input.level,
      soundsEnabled: input.soundsEnabled ?? existing?.soundsEnabled ?? true,
      createdAt: existing?.createdAt ?? Date.now(),
    }
    const row = await saveProfile(next)
    profile.value = row
    return row
  }

  async function toggleSounds(enabled: boolean) {
    if (!profile.value) return
    await save({
      firstName: profile.value.firstName,
      lastName: profile.value.lastName,
      birthday: profile.value.birthday,
      level: profile.value.level,
      soundsEnabled: enabled,
    })
  }

  async function reset() {
    await clearProfile()
    profile.value = null
  }

  return { profile, loaded, isOnboarded, load, save, toggleSounds, reset }
})
