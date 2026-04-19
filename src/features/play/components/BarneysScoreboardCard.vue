<script setup lang="ts">
// Barney's take on ScoreboardCard: big flipping target number, colour-
// coded progress pips for this round's 3 darts, and the running round
// score on the right. Same card chrome as 121's scoreboard so the layout
// feels consistent across modes.
import { ConfettiBurst, Eyebrow, FlipNumber } from '@/design-system'

export type BarneysHit = 'miss' | 'single' | 'double' | 'treble'

interface Props {
  target: string
  currentScore: number
  totalScore: number
  hits: BarneysHit[]
  statusText?: string
  statusTone?: 'success' | 'bust' | 'neutral'
  confetti?: boolean
}

withDefaults(defineProps<Props>(), {
  statusText: '',
  statusTone: 'neutral',
  confetti: false,
})

function pipClass(h: BarneysHit | undefined): string {
  if (!h) return 'pip'
  return `pip pip--${h}`
}
</script>

<template>
  <div class="bsb">
    <ConfettiBurst :active="confetti" />
    <div class="bsb__row">
      <Eyebrow>Target</Eyebrow>
      <div class="bsb__meta">
        <span>Round</span>
        <span class="bsb__meta-val">{{ currentScore }}</span>
        <span>·</span>
        <span>Total</span>
        <span class="bsb__meta-val">{{ totalScore }}</span>
      </div>
    </div>

    <div class="bsb__value">
      <FlipNumber
        v-if="target !== 'Bull'"
        :value="Number(target)"
        :size="88"
        color="var(--ds-brass)"
      />
      <span v-else class="bsb__bull">Bull</span>
    </div>

    <div v-if="statusText" class="bsb__status">{{ statusText }}</div>

    <div class="bsb__pips">
      <span v-for="i in 3" :key="i" :class="pipClass(hits[i - 1])" />
    </div>
  </div>
</template>

<style scoped>
.bsb {
  position: relative;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-xl);
  padding: 20px 20px 16px;
}

.bsb__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.bsb__meta {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.bsb__meta-val {
  color: var(--ds-text);
  font-weight: 700;
  font-size: 14px;
}

.bsb__value {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.bsb__bull {
  font-family: var(--ds-font-mono);
  font-size: 88px;
  font-weight: 700;
  color: var(--ds-brass);
  letter-spacing: -3px;
  line-height: 1;
}

.bsb__status {
  text-align: center;
  margin-bottom: 10px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ds-green);
}

.bsb__pips {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
}

.pip {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(244, 236, 224, 0.08);
  border: 1px solid var(--ds-border-2);
  transition:
    background 0.2s,
    border-color 0.2s,
    box-shadow 0.2s;
}

.pip--miss {
  background: rgba(244, 236, 224, 0.12);
  border-color: var(--ds-muted);
}

.pip--single {
  background: var(--ds-text);
  border-color: var(--ds-text);
  box-shadow: 0 0 8px rgba(244, 236, 224, 0.4);
}

.pip--double {
  background: var(--ds-green);
  border-color: var(--ds-green);
  box-shadow: 0 0 10px var(--ds-green-glow);
}

.pip--treble {
  background: var(--ds-accent);
  border-color: var(--ds-accent);
  box-shadow: 0 0 10px var(--ds-accent-glow);
}
</style>
