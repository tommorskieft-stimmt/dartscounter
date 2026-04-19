<script setup lang="ts">
import { Eyebrow } from '@/design-system'
import type { TurnRecord } from '@/game/types'

interface Props {
  turns: TurnRecord[]
  eyebrow?: string
}

withDefaults(defineProps<Props>(), { eyebrow: 'This Round' })
</script>

<template>
  <section v-if="turns.length" class="turn-log">
    <Eyebrow style="margin-bottom: 6px">{{ eyebrow }}</Eyebrow>
    <div>
      <div v-for="t in turns" :key="t.turnNumber" class="turn-log__row">
        <span class="turn-log__n">#{{ t.turnNumber }}</span>
        <span class="turn-log__darts">{{ t.dartsThrown }}d</span>
        <span
          class="turn-log__score"
          :class="{ 'turn-log__score--bust': t.isBust }"
        >
          {{ t.isBust ? `BUST (${t.scoreThrown})` : `−${t.scoreThrown}` }}
        </span>
        <span class="turn-log__remaining">→ {{ t.remainingAfter }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.turn-log {
  margin-bottom: 8px;
}

.turn-log__row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  margin-bottom: 4px;
  font-family: var(--ds-font-mono);
  font-size: 13px;
}

.turn-log__n {
  color: var(--ds-dim);
  width: 28px;
}

.turn-log__darts {
  color: var(--ds-muted);
  width: 28px;
}

.turn-log__score {
  flex: 1;
  color: var(--ds-text);
  font-weight: 600;
}

.turn-log__score--bust {
  color: var(--ds-accent);
}

.turn-log__remaining {
  color: var(--ds-muted);
}
</style>
