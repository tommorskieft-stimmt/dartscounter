<script setup lang="ts">
import { computed } from 'vue'
import { Eyebrow, PrimaryButton, SecondaryButton, StatTile } from '@/design-system'
import type { MatchDetail } from '@/types/domain'

interface Props {
  detail: MatchDetail
}

const props = defineProps<Props>()

defineEmits<{ playAgain: []; home: [] }>()

const m = computed(() => props.detail.match)
const turns = computed(() => props.detail.turns)

const startScore = computed(() => m.value.startScore ?? 501)
const legsWon = computed(() => m.value.legsWon ?? 0)
const legsTarget = computed(() => m.value.legsTarget ?? null)
const finishedInDarts = computed(() => m.value.finishedInDarts ?? null)
const average = computed(() => m.value.threeDartAverage ?? 0)
const busts = computed(() => turns.value.filter((t) => t.isBust).length)
const highestTurn = computed(() =>
  turns.value.reduce((a, t) => Math.max(a, t.scoreThrown), 0),
)
const tons = computed(() => turns.value.filter((t) => t.scoreThrown >= 100).length)
const oneEighties = computed(() => turns.value.filter((t) => t.scoreThrown === 180).length)

const resultTitle = computed(() => {
  if (finishedInDarts.value) return `Won in ${finishedInDarts.value} darts`
  if (legsWon.value > 0) return `${legsWon.value} leg${legsWon.value === 1 ? '' : 's'} done`
  return 'Match over'
})
</script>

<template>
  <div class="over">
    <div class="over__glow" />

    <div class="over__content">
      <Eyebrow style="margin-bottom: 8px">Match Over</Eyebrow>
      <div class="over__subtitle">
        {{ startScore }} START
        <span class="over__dot">·</span>
        {{ legsTarget ?? '∞' }} LEG{{ legsTarget === 1 ? '' : 'S' }}
      </div>

      <div class="over__hero">
        <Eyebrow style="margin-bottom: 10px">3-Dart Average</Eyebrow>
        <div class="over__hero-value">
          {{ average.toFixed(1) }}
        </div>
        <div class="over__hero-sub">{{ resultTitle }}</div>
      </div>

      <div class="over__grid">
        <StatTile label="Legs Won" :value="legsWon" />
        <StatTile label="Darts Thrown" :value="turns.length * 3" />
        <StatTile label="Highest Turn" :value="highestTurn" />
        <StatTile label="Tons (100+)" :value="tons" />
        <StatTile label="180s" :value="oneEighties" />
        <StatTile label="Busts" :value="busts" />
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
  padding: 28px 20px;
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
  font-size: 80px;
  font-weight: 800;
  color: var(--ds-green);
  letter-spacing: -4px;
  line-height: 1;
  text-shadow: 0 0 24px var(--ds-green-glow);
}

.over__hero-sub {
  margin-top: 10px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  font-weight: 600;
}

.over__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.over__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 28px;
}
</style>
