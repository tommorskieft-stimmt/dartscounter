<script setup lang="ts">
// Full-width overlay that briefly punctuates the jump to the next round
// in 121 Checkout. Consumer drives `open` via a watcher on the round
// number and auto-closes after ~1200ms.
import { BodyText, Eyebrow } from '@/design-system'

interface Props {
  open: boolean
  kind: 'success' | 'fail'
  roundNumber: number
  target: number
  totalRounds?: number | null
}

withDefaults(defineProps<Props>(), { totalRounds: null })
</script>

<template>
  <Teleport to="body">
    <Transition name="round">
      <div
        v-if="open"
        class="round"
        :class="{ 'round--fail': kind === 'fail' }"
        aria-live="polite"
      >
        <div class="round__panel">
          <Eyebrow style="letter-spacing: 3px">
            {{ kind === 'success' ? 'Round won' : 'Round missed' }}
          </Eyebrow>
          <div class="round__title">
            Round {{ roundNumber }}<template v-if="totalRounds">
              <span class="round__dim"> / {{ totalRounds }}</span>
            </template>
          </div>
          <div class="round__target">
            Next target
            <span class="round__target-val">{{ target }}</span>
          </div>
          <BodyText style="font-size: 13px">Three · two · one…</BodyText>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.round {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: var(--ds-backdrop-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  padding: 24px;
}

.round__panel {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-green-dim);
  border-radius: var(--ds-radius-xl);
  padding: 26px 32px;
  text-align: center;
  box-shadow: 0 0 36px var(--ds-green-glow);
  max-width: 380px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.round--fail .round__panel {
  border-color: var(--ds-accent-dim);
  box-shadow: 0 0 36px var(--ds-accent-glow);
}

.round__title {
  font-family: var(--ds-font-display);
  font-size: 28px;
  font-weight: 800;
  color: var(--ds-text);
  letter-spacing: -0.6px;
  margin-top: 4px;
}

.round__dim {
  color: var(--ds-muted);
  font-weight: 600;
}

.round__target {
  font-family: var(--ds-font-mono);
  font-size: 12px;
  letter-spacing: 1.5px;
  color: var(--ds-muted);
  text-transform: uppercase;
}

.round__target-val {
  display: block;
  margin-top: 6px;
  font-family: var(--ds-font-mono);
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -2px;
  color: var(--ds-green);
  text-shadow: 0 0 18px var(--ds-green-glow);
  line-height: 1;
}

.round--fail .round__target-val {
  color: var(--ds-accent);
  text-shadow: 0 0 18px var(--ds-accent-glow);
}

.round-enter-active,
.round-leave-active {
  transition: opacity 0.25s ease;
}

.round-enter-active .round__panel,
.round-leave-active .round__panel {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.round-enter-from,
.round-leave-to {
  opacity: 0;
}

.round-enter-from .round__panel,
.round-leave-to .round__panel {
  transform: translateY(6px) scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .round-enter-active,
  .round-leave-active,
  .round-enter-active .round__panel,
  .round-leave-active .round__panel {
    transition: none;
  }
}
</style>
