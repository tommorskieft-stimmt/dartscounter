<script setup lang="ts">
import { ConfettiBurst, DartsBar, Eyebrow, FlipNumber } from '@/design-system'

interface Props {
  remaining: number
  dartsUsed: number
  maxDarts: number
  statusText?: string
  statusTone?: 'success' | 'bust' | 'neutral'
  confetti?: boolean
  accentColor?: string
}

withDefaults(defineProps<Props>(), {
  statusText: '',
  statusTone: 'neutral',
  confetti: false,
  accentColor: 'var(--ds-text)',
})
</script>

<template>
  <div class="scoreboard">
    <ConfettiBurst :active="confetti" />
    <div class="scoreboard__row">
      <Eyebrow>Remaining</Eyebrow>
      <div class="scoreboard__meta">Darts {{ dartsUsed }}/{{ maxDarts }}</div>
    </div>
    <div class="scoreboard__value">
      <FlipNumber :value="remaining" :size="88" :color="accentColor" />
    </div>
    <div
      v-if="statusText"
      class="scoreboard__status"
      role="status"
      aria-live="polite"
      :class="{
        'scoreboard__status--success': statusTone === 'success',
        'scoreboard__status--bust': statusTone === 'bust',
      }"
    >
      {{ statusText }}
    </div>
    <div :style="{ marginTop: statusText ? '0' : '10px' }">
      <DartsBar :used="dartsUsed" :max="maxDarts" />
    </div>
  </div>
</template>

<style scoped>
.scoreboard {
  position: relative;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-xl);
  padding: 20px 20px 16px;
}

.scoreboard__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.scoreboard__meta {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  font-weight: 600;
}

.scoreboard__value {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.scoreboard__status {
  text-align: center;
  margin-bottom: 10px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
  color: var(--ds-brass);
}

.scoreboard__status--success {
  color: var(--ds-green);
}

.scoreboard__status--bust {
  color: var(--ds-accent);
}
</style>
