<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Eyebrow, SegmentGroup } from '@/design-system'
import CheckoutHelperSheet from '@/features/play/components/CheckoutHelperSheet.vue'
import CheckoutRouteCard from '@/features/play/components/CheckoutRouteCard.vue'
import PlayTopBar from '@/features/play/components/PlayTopBar.vue'
import QuitConfirmDialog from '@/features/play/components/QuitConfirmDialog.vue'
import ScoreboardCard from '@/features/play/components/ScoreboardCard.vue'
import TurnInputCard from '@/features/play/components/TurnInputCard.vue'
import TurnLogList from '@/features/play/components/TurnLogList.vue'
import UndoHelpRow from '@/features/play/components/UndoHelpRow.vue'
import { persistStandardMatch } from '@/features/play/persistence'
import { useStandardCheckoutStore } from '@/stores/standardCheckout'
import { haptic } from '@/services/haptics'
import type { StandardStartScore } from '@/types/domain'

interface Props {
  startScore: StandardStartScore
  legsTarget: number | null
}

const props = defineProps<Props>()
const router = useRouter()
const session = useStandardCheckoutStore()
const helperOpen = ref(false)
const quitDialogOpen = ref(false)
const showConfetti = ref(false)
const finishAsDouble = ref<'yes' | 'no'>('yes')
let confettiTimer: number | undefined

onMounted(() => {
  session.start({ startScore: props.startScore, legsTarget: props.legsTarget })
})

const legsLabel = computed(() => {
  if (props.legsTarget === null) return `Leg ${session.legsWon + 1}`
  return `${session.legsWon} / ${props.legsTarget}`
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
    if (st.kind === 'finished') await finishMatch(true)
  },
  { deep: true },
)

async function finishMatch(completed: boolean) {
  const matchId = await persistStandardMatch({
    startScore: session.startScore,
    legsTarget: session.legsTarget,
    legsWon: session.legsWon,
    dartsTotal: session.dartsTotal,
    threeDartAverage: session.threeDartAverage,
    turns: session.turns,
    completed,
  })
  if (matchId !== null) {
    await router.replace({ name: 'play-over', query: { id: matchId } })
  } else {
    await router.replace({ name: 'home' })
  }
}

function handleSubmit(payload: { scoreThrown: number; dartsThrown: 1 | 2 | 3 }) {
  const result = session.submit(
    payload.scoreThrown,
    payload.dartsThrown,
    finishAsDouble.value === 'yes',
  )
  if (result.kind === 'turnRecorded' || result.kind === 'legFinished') haptic('light')
}

function handleUndo() {
  if (session.undo()) haptic('soft')
}

function hasProgress(): boolean {
  return session.legsWon > 0 || session.turns.length > 0
}

function handleQuit() {
  if (!hasProgress()) {
    session.quit()
    void router.replace({ name: 'home' })
    return
  }
  quitDialogOpen.value = true
}

async function confirmSaveAndExit() {
  quitDialogOpen.value = false
  session.quit()
  await finishMatch(session.legsWon >= (session.legsTarget ?? 1))
}

async function confirmDiscardAndExit() {
  quitDialogOpen.value = false
  session.quit()
  await router.replace({ name: 'home' })
}

function quitProgressLabel(): string {
  const legs = session.legsWon
  const darts = session.dartsTotal
  if (legs > 0) return `${legs} leg${legs === 1 ? '' : 's'} won · ${darts} darts`
  return `${session.turns.length} turn${session.turns.length === 1 ? '' : 's'} · ${darts} darts`
}
</script>

<template>
  <section class="live">
    <PlayTopBar
      quit-label="Quit"
      center-eyebrow="Legs"
      :center-value="legsLabel"
      right-eyebrow="Avg"
      :right-value="session.threeDartAverage.toFixed(1)"
      right-tone="green"
      @quit="handleQuit"
    />

    <ScoreboardCard
      :remaining="session.remaining"
      :darts-used="session.dartsThisLeg"
      :max-darts="Math.max(session.dartsThisLeg, 30)"
      :status-text="statusText"
      :status-tone="statusTone"
      :confetti="showConfetti"
      :accent-color="remainingColor"
      style="margin-bottom: 10px"
    />

    <UndoHelpRow
      :can-undo="session.turns.length > 0"
      @undo="handleUndo"
      @help="helperOpen = true"
    />

    <CheckoutRouteCard :route="session.currentRoute" style="margin-bottom: 14px" />

    <div class="live__double">
      <Eyebrow style="margin-bottom: 8px">Last dart was a double?</Eyebrow>
      <SegmentGroup v-model="finishAsDouble" :options="['yes', 'no']" />
      <p class="live__hint">
        Flip to "yes" on the turn that finishes the leg. The double-out rule applies only on the
        final dart — all other turns keep "no".
      </p>
    </div>

    <TurnInputCard :darts-available="3" style="margin-bottom: 14px" @submit="handleSubmit" />

    <TurnLogList :turns="session.turns" eyebrow="This Leg" />

    <CheckoutHelperSheet :open="helperOpen" :max-darts="3" @close="helperOpen = false" />

    <QuitConfirmDialog
      :open="quitDialogOpen"
      :progress-label="quitProgressLabel()"
      @save="confirmSaveAndExit"
      @discard="confirmDiscardAndExit"
      @cancel="quitDialogOpen = false"
    />
  </section>
</template>

<style scoped>
.live {
  padding: 56px 20px 40px;
  box-sizing: border-box;
  min-height: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.live__double {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 12px 14px;
  margin-bottom: 14px;
}

.live__hint {
  margin: 8px 0 0;
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--ds-dim);
  text-transform: uppercase;
}
</style>
