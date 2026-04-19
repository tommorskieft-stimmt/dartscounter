<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BodyText, ConfettiBurst, Eyebrow, PrimaryButton, SecondaryButton } from '@/design-system'
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

const targetLabel = computed(() => {
  const t = session.currentTarget
  if (t === null) return '—'
  return t === 'Bull' ? 'Bull' : String(t)
})

const isBullTarget = computed(() => session.currentTarget === 'Bull')

const progressLabel = computed(() => `${session.targetIndex + 1} / ${BARNEYS_TARGETS.length}`)

const dartsThisTarget = computed(() => session.currentHits.length)

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

watch(
  () => session.status,
  async (st) => {
    if (st.kind === 'finished') await finishMatch()
  },
  { deep: true },
)

async function finishMatch() {
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

function record(hit: BarneysHit) {
  const out = session.recordHit(hit)
  if (out.kind === 'invalid') return
  if (out.kind === 'roundCompleted') haptic('soft')
  else if (out.kind !== 'matchFinished') haptic('light')
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
  await finishMatch()
}

async function confirmDiscardAndExit() {
  quitDialogOpen.value = false
  session.quit()
  await router.replace({ name: 'home' })
}

function quitProgressLabel(): string {
  return `${session.pastRounds.length} target${session.pastRounds.length === 1 ? '' : 's'} · ${session.totalScore} pts`
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

    <div class="live__target">
      <ConfettiBurst :active="showConfetti" />
      <Eyebrow>Hit</Eyebrow>
      <div class="live__target-big">{{ targetLabel }}</div>
      <BodyText style="margin-top: 6px; font-size: 14px">
        Dart {{ dartsThisTarget + 1 }} of 3 — tap what lands.
      </BodyText>
      <div class="live__dots" aria-hidden="true">
        <span
          v-for="i in 3"
          :key="i"
          class="live__dot"
          :class="{ 'live__dot--on': i <= dartsThisTarget }"
        />
      </div>
    </div>

    <div v-if="!isBullTarget" class="live__grid">
      <button type="button" class="live__hit live__hit--miss" @click="record('miss')">
        <span class="live__hit-label">Miss</span>
        <span class="live__hit-pts">0</span>
      </button>
      <button type="button" class="live__hit" @click="record('single')">
        <span class="live__hit-label">Single {{ session.currentTarget }}</span>
        <span class="live__hit-pts">1</span>
      </button>
      <button type="button" class="live__hit live__hit--green" @click="record('double')">
        <span class="live__hit-label">Double {{ session.currentTarget }}</span>
        <span class="live__hit-pts">2</span>
      </button>
      <button type="button" class="live__hit live__hit--red" @click="record('treble')">
        <span class="live__hit-label">Treble {{ session.currentTarget }}</span>
        <span class="live__hit-pts">3</span>
      </button>
    </div>

    <div v-else class="live__grid live__grid--bull">
      <button type="button" class="live__hit live__hit--miss" @click="record('miss')">
        <span class="live__hit-label">Miss</span>
        <span class="live__hit-pts">0</span>
      </button>
      <button type="button" class="live__hit live__hit--green" @click="record('double')">
        <span class="live__hit-label">Outer Bull</span>
        <span class="live__hit-pts">2</span>
      </button>
      <button type="button" class="live__hit live__hit--red" @click="record('treble')">
        <span class="live__hit-label">Bullseye</span>
        <span class="live__hit-pts">3</span>
      </button>
    </div>

    <div class="live__counts">
      <div class="live__count">
        <span class="live__count-label">This target</span>
        <span class="live__count-value">{{ session.currentScore }}</span>
      </div>
      <div class="live__count">
        <span class="live__count-label">Darts thrown</span>
        <span class="live__count-value">{{ session.dartsThrownTotal }}</span>
      </div>
    </div>

    <div class="live__actions">
      <SecondaryButton @click="handleUndo">Undo</SecondaryButton>
      <PrimaryButton @click="handleQuit">Finish</PrimaryButton>
    </div>

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

.live__target {
  position: relative;
  text-align: center;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-xl);
  padding: 20px;
  margin-bottom: 14px;
}

.live__target-big {
  font-family: var(--ds-font-mono);
  font-size: 72px;
  font-weight: 800;
  color: var(--ds-brass);
  letter-spacing: -4px;
  line-height: 1;
  margin-top: 10px;
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

.live__dots {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.live__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(244, 236, 224, 0.1);
  transition: background 0.15s;
}

.live__dot--on {
  background: var(--ds-brass);
  box-shadow: 0 0 8px rgba(217, 165, 74, 0.55);
}

.live__hit {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 14px;
  min-height: 80px;
  border-radius: var(--ds-radius-lg);
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border-2);
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s;
}

.live__hit:active {
  transform: scale(0.97);
}

.live__hit--miss {
  background: var(--ds-bg-3);
}

.live__hit--red {
  background: rgba(229, 50, 40, 0.12);
  border-color: var(--ds-accent-dim);
}

.live__hit--green {
  background: rgba(70, 160, 110, 0.12);
  border-color: var(--ds-green-dim);
}

.live__hit-label {
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.live__hit-pts {
  font-family: var(--ds-font-mono);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -1px;
}

.live__counts {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.live__count {
  flex: 1;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.live__count-label {
  font-family: var(--ds-font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  text-transform: uppercase;
}

.live__count-value {
  font-family: var(--ds-font-mono);
  font-size: 22px;
  font-weight: 700;
  color: var(--ds-text);
}

.live__actions {
  display: flex;
  gap: 10px;
}
</style>
