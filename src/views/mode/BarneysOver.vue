<script setup lang="ts">
import { computed } from 'vue'
import { Eyebrow, PrimaryButton, RoundTile, SecondaryButton, StatTile } from '@/design-system'
import { BARNEYS_TARGETS } from '@/stores/barneys'
import type { MatchDetail } from '@/types/domain'

interface Props {
  detail: MatchDetail
}

const props = defineProps<Props>()

defineEmits<{ playAgain: []; home: [] }>()

const score = computed(() => props.detail.match.barneysScore ?? 0)
const maxHits = computed(() => props.detail.match.barneysMaxHits ?? [])
const dartsTotal = computed(() => maxHits.value.reduce((a, b) => a + b, 0))
const fullRun = computed(() => maxHits.value.every((h) => h === 3))
const pctOfMax = computed(() => Math.round((score.value / 63) * 100))
const bestTarget = computed(() => {
  let idx = 0
  let best = -1
  maxHits.value.forEach((hits, i) => {
    if (hits > best) {
      best = hits
      idx = i
    }
  })
  return BARNEYS_TARGETS[idx] ?? 20
})
</script>

<template>
  <div class="over">
    <div class="over__glow" />

    <div class="over__content">
      <Eyebrow style="margin-bottom: 8px">Drill Over</Eyebrow>
      <div class="over__subtitle">
        {{ fullRun ? 'FULL RUN' : 'QUIT EARLY' }}
        <span class="over__dot">·</span>
        {{ dartsTotal }}/21 DARTS
      </div>

      <div class="over__hero">
        <Eyebrow style="margin-bottom: 10px">Score</Eyebrow>
        <div class="over__hero-value">
          {{ score }}<span class="over__hero-pct">/63</span>
        </div>
        <div class="over__hero-sub">{{ pctOfMax }}% of max</div>
      </div>

      <div class="over__grid">
        <StatTile label="Best Target" :value="String(bestTarget)" />
        <StatTile label="Points per Dart" :value="(dartsTotal === 0 ? 0 : score / dartsTotal).toFixed(2)" />
      </div>

      <div class="over__section">
        <Eyebrow style="margin-bottom: 10px">Per Target</Eyebrow>
        <div class="over__tiles">
          <RoundTile
            v-for="(hits, i) in maxHits"
            :key="i"
            :target="String(BARNEYS_TARGETS[i] ?? 20)"
            :success="hits > 0"
            :detail="`${hits}/3`"
          />
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
  background: radial-gradient(circle, var(--ds-accent-glow) 0%, transparent 60%);
  filter: blur(30px);
  opacity: 0.4;
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
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-accent-dim);
  border-radius: var(--ds-radius-xl);
  box-shadow: 0 0 30px var(--ds-accent-glow);
}

.over__hero-value {
  font-family: var(--ds-font-mono);
  font-size: 80px;
  font-weight: 800;
  color: var(--ds-brass);
  letter-spacing: -4px;
  line-height: 1;
  text-shadow: 0 0 24px var(--ds-accent-glow);
}

.over__hero-pct {
  font-size: 40px;
  opacity: 0.5;
  color: var(--ds-muted);
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

.over__section {
  margin-top: 28px;
}

.over__tiles {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.over__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 28px;
}
</style>
