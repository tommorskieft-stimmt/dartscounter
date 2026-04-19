<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Eyebrow, SecondaryButton } from '@/design-system'
import BarneysScoreboardCard from '@/features/play/components/BarneysScoreboardCard.vue'
import PlayTopBar from '@/features/play/components/PlayTopBar.vue'
import QuitConfirmDialog from '@/features/play/components/QuitConfirmDialog.vue'
import { persistBarneysMatch } from '@/features/play/persistence'
import { BARNEYS_TARGETS, useBarneysStore, type BarneysHit } from '@/stores/barneys'
import { haptic } from '@/services/haptics'

const router = useRouter()
const session = useBarneysStore()
const showConfetti = ref(false)
const quitDialogOpen = ref(false)
let confettiTimer: number | undefined

onMounted(() => {
  session.start()
})

onBeforeUnmount(() => {
  if (confettiTimer) window.clearTimeout(confettiTimer)
})

const targetLabel = computed(() => {
  const t = session.currentTarget
  if (t === null) return '—'
  return t === 'Bull' ? 'Bull' : String(t)
})

const isBullTarget = computed(() => session.currentTarget === 'Bull')
const progressLabel = computed(() => `${session.targetIndex + 1} / ${BARNEYS_TARGETS.length}`)

const statusText = computed(() => {
  const n = session.currentHits.length
  if (session.status.kind === 'finished') return 'Drill complete'
  if (n === 0) return ''
  return `Dart ${n} of 3`
})

watch(
  () => session.confettiTrigger,
  (n, prev) => {
    if (n === prev) return
    showConfetti.value = true
    haptic('success')
    if (confettiTimer) window.clearTimeout(confettiTimer)
    confettiTimer = window.setTimeout(() => {
      showConfetti.value = false
    }, 1400)
  },
)

async function saveAndGoToOver() {
  const matchId = await persistBarneysMatch({
    totalScore: session.totalScore,
    perTargetHits: session.perTargetHits.map((hits) => hits.slice()),
  })
  if (matchId !== null) {
    await router.replace({ name: 'play-over', query: { id: matchId } })
  } else {
    await router.replace({ name: 'home' })
  }
}

async function record(hit: BarneysHit) {
  const out = session.recordHit(hit)
  if (out.kind === 'invalid') return
  if (out.kind === 'matchFinished') {
    haptic('success')
    await saveAndGoToOver()
    return
  }
  if (out.kind === 'roundCompleted') haptic('soft')
  else haptic('light')
}

function handleUndo() {
  if (session.undo()) haptic('soft')
}

function hasProgress(): boolean {
  return session.pastRounds.length > 0 || session.currentHits.length > 0
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
  await saveAndGoToOver()
}

async function confirmDiscardAndExit() {
  quitDialogOpen.value = false
  session.quit()
  await router.replace({ name: 'home' })
}

const quitProgressLabel = computed(
  () => `${session.pastRounds.length} target${session.pastRounds.length === 1 ? '' : 's'} · ${session.totalScore} pts`,
)

function hitLabel(kind: BarneysHit, targetIsBull: boolean): string {
  if (targetIsBull) {
    if (kind === 'miss') return 'Miss'
    if (kind === 'double') return 'Outer Bull'
    if (kind === 'treble') return 'Bullseye'
    return 'Single'
  }
  if (kind === 'miss') return 'Miss'
  if (kind === 'single') return `Single ${session.currentTarget}`
  if (kind === 'double') return `Double ${session.currentTarget}`
  return `Treble ${session.currentTarget}`
}
</script>

<template>
  <section class="live">
    <PlayTopBar
      quit-label="Quit"
      center-eyebrow="Target"
      :center-value="progressLabel"
      right-eyebrow="Score"
      :right-value="String(session.totalScore)"
      right-tone="green"
      @quit="handleQuit"
    />

    <BarneysScoreboardCard
      :target="targetLabel"
      :current-score="session.currentScore"
      :total-score="session.totalScore"
      :hits="session.currentHits"
      :status-text="statusText"
      :confetti="showConfetti"
      style="margin-bottom: 10px"
    />

    <div class="live__undo-row">
      <button
        type="button"
        class="live__undo"
        :class="{ 'live__undo--disabled': !hasProgress() }"
        :disabled="!hasProgress()"
        @click="handleUndo"
      >
        <span class="live__undo-icon">↶</span> Undo
      </button>
    </div>

    <Eyebrow style="margin: 0 0 10px">Tap what landed</Eyebrow>
    <div v-if="!isBullTarget" class="live__grid">
      <button type="button" class="live__hit live__hit--miss" @click="record('miss')">
        <span class="live__hit-label">{{ hitLabel('miss', false) }}</span>
        <span class="live__hit-pts">0</span>
      </button>
      <button type="button" class="live__hit live__hit--single" @click="record('single')">
        <span class="live__hit-label">{{ hitLabel('single', false) }}</span>
        <span class="live__hit-pts">+1</span>
      </button>
      <button type="button" class="live__hit live__hit--green" @click="record('double')">
        <span class="live__hit-label">{{ hitLabel('double', false) }}</span>
        <span class="live__hit-pts">+2</span>
      </button>
      <button type="button" class="live__hit live__hit--red" @click="record('treble')">
        <span class="live__hit-label">{{ hitLabel('treble', false) }}</span>
        <span class="live__hit-pts">+3</span>
      </button>
    </div>

    <div v-else class="live__grid live__grid--bull">
      <button type="button" class="live__hit live__hit--miss" @click="record('miss')">
        <span class="live__hit-label">{{ hitLabel('miss', true) }}</span>
        <span class="live__hit-pts">0</span>
      </button>
      <button type="button" class="live__hit live__hit--green" @click="record('double')">
        <span class="live__hit-label">{{ hitLabel('double', true) }}</span>
        <span class="live__hit-pts">+2</span>
      </button>
      <button type="button" class="live__hit live__hit--red" @click="record('treble')">
        <span class="live__hit-label">{{ hitLabel('treble', true) }}</span>
        <span class="live__hit-pts">+3</span>
      </button>
    </div>

    <div class="live__finish">
      <SecondaryButton @click="handleQuit">Finish drill</SecondaryButton>
    </div>

    <QuitConfirmDialog
      :open="quitDialogOpen"
      :progress-label="quitProgressLabel"
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

.live__undo-row {
  margin-bottom: 14px;
}

.live__undo {
  width: 100%;
  height: 36px;
  border: 1px solid var(--ds-border-2);
  background: rgba(244, 236, 224, 0.04);
  color: var(--ds-text);
  border-radius: 9px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.live__undo--disabled {
  color: var(--ds-dim);
  background: transparent;
  cursor: not-allowed;
}

.live__undo-icon {
  font-size: 13px;
}

.live__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}

.live__grid--bull {
  grid-template-columns: 1fr;
}

.live__hit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  min-height: 68px;
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border-2);
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.1s,
    box-shadow 0.12s;
}

.live__hit:active {
  transform: scale(0.97);
}

.live__hit--miss {
  background: var(--ds-bg-3);
}

.live__hit--single {
  background: rgba(244, 236, 224, 0.04);
}

.live__hit--red {
  background: rgba(229, 50, 40, 0.12);
  border-color: var(--ds-accent-dim);
}

.live__hit--red:active {
  box-shadow: 0 0 18px var(--ds-accent-glow);
}

.live__hit--green {
  background: rgba(70, 160, 110, 0.12);
  border-color: var(--ds-green-dim);
}

.live__hit--green:active {
  box-shadow: 0 0 18px var(--ds-green-glow);
}

.live__hit-label {
  font-size: 14px;
  letter-spacing: 0.3px;
}

.live__hit-pts {
  font-family: var(--ds-font-mono);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -1px;
}

.live__finish {
  margin-top: 4px;
}
</style>
