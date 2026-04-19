<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eyebrow, PrimaryButton, RoundTile, SecondaryButton, StatTile } from '@/design-system'
import type { MatchDetail } from '@/types/domain'

interface Props {
  detail: MatchDetail
}

const props = defineProps<Props>()

defineEmits<{ playAgain: []; home: [] }>()

const selectedRound = ref<number | null>(null)

const successes = computed(() => props.detail.rounds.filter((r) => r.success))
const fails = computed(() => props.detail.rounds.filter((r) => !r.success))

const checkoutRate = computed(() => {
  const total = props.detail.rounds.length
  if (total === 0) return 0
  return Math.round((successes.value.length / total) * 100)
})

const avgDartsToOut = computed(() => {
  if (successes.value.length === 0) return null
  const sum = successes.value.reduce((a, r) => a + r.dartsUsed, 0)
  return (sum / successes.value.length).toFixed(1)
})

const fewestDarts = computed(() => {
  if (successes.value.length === 0) return null
  return Math.min(...successes.value.map((r) => r.dartsUsed))
})

const highestOut = computed(() => {
  if (successes.value.length === 0) return null
  return Math.max(...successes.value.map((r) => r.target))
})

const targetRange = computed(() => {
  const ts = props.detail.rounds.map((r) => r.target)
  if (ts.length === 0) return '—'
  return `${Math.min(...ts)}–${Math.max(...ts)}`
})

const bestStreak = computed(() => {
  let best = 0
  let cur = 0
  for (const r of props.detail.rounds) {
    if (r.success) {
      cur += 1
      if (cur > best) best = cur
    } else {
      cur = 0
    }
  }
  return best
})

const tooltip = computed(() => {
  const n = selectedRound.value
  if (!n) return 'Tap a tile for details'
  const r = props.detail.rounds.find((x) => x.roundNumber === n)
  if (!r) return 'Tap a tile for details'
  return r.success
    ? `Round ${r.roundNumber}: ${r.target} in ${r.dartsUsed} darts`
    : `Round ${r.roundNumber}: ${r.target} missed`
})

const finalTarget = computed(() => props.detail.match.finalTarget ?? 121)
const maxDarts = computed(() => props.detail.match.maxDarts ?? 9)
</script>

<template>
  <div class="over">
    <div class="over__glow" />

    <div class="over__content">
      <Eyebrow style="margin-bottom: 8px">Match Over</Eyebrow>
      <div class="over__subtitle">
        {{ detail.rounds.length }} ROUND{{ detail.rounds.length === 1 ? '' : 'S' }}
        <span class="over__dot">·</span>
        MAX {{ maxDarts }} DARTS
      </div>

      <div class="over__hero">
        <Eyebrow style="margin-bottom: 10px">Checkout Rate</Eyebrow>
        <div class="over__hero-value">
          {{ checkoutRate }}<span class="over__hero-pct">%</span>
        </div>
        <div class="over__hero-sub">
          <span class="over__hero-hit">{{ successes.length }}</span> CHECKED OUT
          <span class="over__dot">·</span>
          <span class="over__hero-miss">{{ fails.length }}</span> MISSED
        </div>
      </div>

      <div class="over__grid">
        <StatTile label="Final Target" :value="finalTarget" />
        <StatTile label="Best Streak" :value="bestStreak" />
        <StatTile label="Avg Darts to Out" :value="avgDartsToOut" />
        <StatTile label="Fewest Darts" :value="fewestDarts" />
        <StatTile label="Highest Out" :value="highestOut" />
        <StatTile label="Target Range" :value="targetRange" />
      </div>

      <div class="over__section">
        <Eyebrow style="margin-bottom: 10px">Round by Round</Eyebrow>
        <div class="over__tiles">
          <RoundTile
            v-for="r in detail.rounds"
            :key="r.roundNumber"
            :target="r.target"
            :success="r.success"
            :detail="r.success ? `${r.dartsUsed}d` : '✕'"
            :selected="selectedRound === r.roundNumber"
            @click="selectedRound = r.roundNumber"
          />
        </div>
        <div class="over__tooltip" :class="{ 'over__tooltip--on': selectedRound !== null }">
          {{ tooltip }}
        </div>
      </div>

      <div class="over__actions">
        <PrimaryButton @click="$emit('playAgain')">▸ Play Again</PrimaryButton>
        <SecondaryButton @click="$emit('home')">Home</SecondaryButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.over {
  position: relative;
  padding: 60px var(--ds-edge-padding) 32px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100%;
}

.over__glow {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 300px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, var(--ds-green-glow) 0%, transparent 60%);
  filter: blur(30px);
  opacity: 0.5;
  z-index: 0;
}

.over__content {
  position: relative;
  z-index: 1;
}

.over__subtitle {
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  font-weight: 600;
}

.over__dot {
  color: var(--ds-dim);
  margin: 0 6px;
}

.over__hero {
  margin: 24px 0;
  padding: 24px 20px;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(70, 160, 110, 0.06) 0%,
    var(--ds-bg-2) 50%,
    rgba(229, 50, 40, 0.08) 100%
  );
  border: 1px solid var(--ds-green-dim);
  border-radius: var(--ds-radius-xl);
  box-shadow:
    0 0 30px var(--ds-green-glow),
    inset 0 1px 0 rgba(244, 236, 224, 0.06);
}

.over__hero-value {
  font-family: var(--ds-font-mono);
  font-size: 72px;
  font-weight: 800;
  color: var(--ds-green);
  letter-spacing: -3px;
  line-height: 1;
  text-shadow: 0 0 24px var(--ds-green-glow);
}

.over__hero-pct {
  font-size: 40px;
  opacity: 0.6;
}

.over__hero-sub {
  margin-top: 10px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  font-weight: 600;
}

.over__hero-hit {
  color: var(--ds-green);
}

.over__hero-miss {
  color: var(--ds-accent);
}

.over__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.over__section {
  margin-top: 28px;
}

.over__tiles {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.over__tooltip {
  min-height: 20px;
  margin-top: 10px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--ds-muted);
  text-align: center;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.over__tooltip--on {
  opacity: 1;
}

.over__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
}
</style>
