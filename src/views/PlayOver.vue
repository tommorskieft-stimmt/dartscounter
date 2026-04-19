<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BackButton, BodyText, Heading } from '@/design-system'
import { getMatchDetail } from '@/db/repositories/matches'
import Checkout121Over from '@/views/mode/Checkout121Over.vue'
import StandardOver from '@/views/mode/StandardOver.vue'
import BarneysOver from '@/views/mode/BarneysOver.vue'
import type { MatchDetail } from '@/types/domain'
import { usePlayConfigStore } from '@/stores/playConfig'

const route = useRoute()
const router = useRouter()
const playConfig = usePlayConfigStore()

const detail = ref<MatchDetail | null>(null)
const loaded = ref(false)

onMounted(async () => {
  const raw = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id
  const id = raw ? Number(raw) : Number.NaN
  if (!Number.isInteger(id)) {
    loaded.value = true
    return
  }
  detail.value = (await getMatchDetail(id)) ?? null
  loaded.value = true
})

function playAgain() {
  if (playConfig.mode) {
    router.replace({ name: 'play-live' })
  } else {
    router.replace({ name: 'play-setup' })
  }
}

function goHome() {
  router.replace({ name: 'home' })
}

const gameType = computed(() => detail.value?.match.gameType)
</script>

<template>
  <div v-if="!loaded" class="over-loading">
    <BodyText>Loading match…</BodyText>
  </div>

  <div v-else-if="!detail" class="over-missing">
    <div style="padding: 60px 24px 24px">
      <BackButton label="Home" @click="goHome" />
    </div>
    <Heading :size="28" style="padding: 0 24px">Match not found</Heading>
    <BodyText style="padding: 10px 24px 24px">
      The summary for that match isn't available. Head back home and start a fresh game.
    </BodyText>
  </div>

  <Checkout121Over
    v-else-if="gameType === 'checkout121'"
    :detail="detail"
    @play-again="playAgain"
    @home="goHome"
  />
  <StandardOver
    v-else-if="gameType === 'standardCheckout'"
    :detail="detail"
    @play-again="playAgain"
    @home="goHome"
  />
  <BarneysOver
    v-else-if="gameType === 'barneys'"
    :detail="detail"
    @play-again="playAgain"
    @home="goHome"
  />
</template>

<style scoped>
.over-loading {
  padding: 40% 24px;
  text-align: center;
}

.over-missing {
  min-height: 100%;
  box-sizing: border-box;
}
</style>
