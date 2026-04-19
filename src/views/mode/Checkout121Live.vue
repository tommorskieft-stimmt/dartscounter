<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import CheckoutHelperSheet from '@/features/play/components/CheckoutHelperSheet.vue'
import CheckoutRouteCard from '@/features/play/components/CheckoutRouteCard.vue'
import PlayTopBar from '@/features/play/components/PlayTopBar.vue'
import ScoreboardCard from '@/features/play/components/ScoreboardCard.vue'
import TurnInputCard from '@/features/play/components/TurnInputCard.vue'
import TurnLogList from '@/features/play/components/TurnLogList.vue'
import UndoHelpRow from '@/features/play/components/UndoHelpRow.vue'
import { persist121Match } from '@/features/play/persistence'
import { useCheckout121Store } from '@/stores/checkout121'
import { haptic } from '@/services/haptics'

interface Props {
  maxDarts: number
  rounds: number | null
}

const props = defineProps<Props>()
const router = useRouter()
const session = useCheckout121Store()
const helperOpen = ref(false)
const showConfetti = ref(false)
let confettiTimer: number | undefined

onMounted(() => {
  session.start({ maxDarts: props.maxDarts, rounds: props.rounds })
})

const roundsLabel = computed(() => {
  if (props.rounds === null) return String(session.currentRoundNumber)
  return `${session.currentRoundNumber} / ${props.rounds}`
})

const statusText = computed(() => {
  const st = session.status
  if (st.kind === 'success' || st.kind === 'bust') return st.message
  return ''
})

const statusTone = computed<'success' | 'bust' | 'neutral'>(() => {
  const k = session.status.kind
  if (k === 'success') return 'success'
  if (k === 'bust') return 'bust'
  return 'neutral'
})

const remainingColor = computed(() =>
  session.remaining === 0 ? 'var(--ds-green)' : 'var(--ds-text)',
)

watch(
  () => session.confettiTrigger,
  (n, prev) => {
    if (n === prev) return
    showConfetti.value = true
    haptic('success')
    if (confettiTimer) window.clearTimeout(confettiTimer)
    confettiTimer = window.setTimeout(() => {
      showConfetti.value = false
    }, 900)
  },
)

watch(
  () => session.status,
  async (st) => {
    if (st.kind === 'bust') haptic('error')
    if (st.kind === 'finished') {
      const matchId = await persist121Match({
        history: session.history,
        finalTarget: session.finalTarget,
        maxDarts: session.maxDarts,
        rounds: session.rounds,
      })
      if (matchId !== null) {
        await router.replace({ name: 'play-over', query: { id: matchId } })
      } else {
        await router.replace({ name: 'home' })
      }
    }
  },
  { deep: true },
)

function handleSubmit(payload: { scoreThrown: number; dartsThrown: 1 | 2 | 3 }) {
  const result = session.submit(payload.scoreThrown, payload.dartsThrown)
  if (result.kind === 'turnRecorded' || result.kind === 'roundCompleted') {
    haptic('light')
  }
}

function handleUndo() {
  if (session.undo()) haptic('soft')
}

async function handleQuit() {
  const history = session.quit()
  if (history.length === 0) {
    await router.replace({ name: 'home' })
    return
  }
  const matchId = await persist121Match({
    history,
    finalTarget: session.finalTarget,
    maxDarts: session.maxDarts,
    rounds: session.rounds,
  })
  if (matchId !== null) {
    await router.replace({ name: 'play-over', query: { id: matchId } })
  } else {
    await router.replace({ name: 'home' })
  }
}
</script>

<template>
  <section class="live">
    <PlayTopBar
      quit-label="Quit"
      center-eyebrow="Round"
      :center-value="roundsLabel"
      right-eyebrow="Target"
      :right-value="String(session.target)"
      right-tone="green"
      @quit="handleQuit"
    />

    <ScoreboardCard
      :remaining="session.remaining"
      :darts-used="session.dartsUsed"
      :max-darts="session.maxDarts"
      :status-text="statusText"
      :status-tone="statusTone"
      :confetti="showConfetti"
      :accent-color="remainingColor"
      style="margin-bottom: 10px"
    />

    <UndoHelpRow
      :can-undo="session.currentTurns.length > 0"
      @undo="handleUndo"
      @help="helperOpen = true"
    />

    <CheckoutRouteCard :route="session.currentRoute" style="margin-bottom: 14px" />

    <TurnInputCard
      :darts-available="session.dartsRemainingThisRound"
      style="margin-bottom: 14px"
      @submit="handleSubmit"
    />

    <TurnLogList :turns="session.currentTurns" />

    <CheckoutHelperSheet
      :open="helperOpen"
      :max-darts="session.maxDarts"
      @close="helperOpen = false"
    />
  </section>
</template>

<style scoped>
.live {
  padding: 56px 20px 24px;
  box-sizing: border-box;
  min-height: 100%;
}
</style>
