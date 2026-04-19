import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { GameMode } from '@/game/GameMode'

// The bridge between PlaySetup.vue (configure) and PlayLive.vue (play).
// Kept tiny on purpose — this is ephemeral, not persisted.
export const usePlayConfigStore = defineStore('playConfig', () => {
  const mode = ref<GameMode | null>(null)

  function set(m: GameMode) {
    mode.value = m
  }

  function clear() {
    mode.value = null
  }

  return { mode, set, clear }
})
