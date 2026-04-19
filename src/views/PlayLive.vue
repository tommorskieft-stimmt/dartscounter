<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Checkout121Live from '@/views/mode/Checkout121Live.vue'
import StandardLive from '@/views/mode/StandardLive.vue'
import BarneysLive from '@/views/mode/BarneysLive.vue'
import { usePlayConfigStore } from '@/stores/playConfig'

const router = useRouter()
const playConfig = usePlayConfigStore()

// Refresh on /play/live with no pending config → bounce back to setup.
onMounted(async () => {
  if (!playConfig.mode) {
    await router.replace({ name: 'play-setup' })
  }
})

const mode = computed(() => playConfig.mode)
</script>

<template>
  <Checkout121Live
    v-if="mode && mode.type === 'checkout121'"
    :max-darts="mode.maxDarts"
    :rounds="mode.rounds"
  />
  <StandardLive
    v-else-if="mode && mode.type === 'standardCheckout'"
    :start-score="mode.startScore"
    :legs-target="mode.legs"
  />
  <BarneysLive v-else-if="mode && mode.type === 'barneys'" />
</template>
