<script setup lang="ts">
import { Eyebrow, RouteDart } from '@/design-system'
import { toLabel } from '@/game/DartNotation'
import type { RouteResult } from '@/game/CheckoutEngine'

interface Props {
  route: RouteResult
}

const props = defineProps<Props>()

function description(r: RouteResult): string | null {
  switch (r.kind) {
    case 'done':
      return '— checked out —'
    case 'bust':
      return 'must be ≥ 2'
    case 'noOut':
      return 'no out shot'
    case 'route':
      return null
  }
}

const label = (() => description(props.route))()
</script>

<template>
  <section class="route-card">
    <Eyebrow style="margin-bottom: 8px">Checkout Route</Eyebrow>
    <div v-if="label" class="route-card__empty">{{ label }}</div>
    <div v-else-if="route.kind === 'route'" class="route-card__darts">
      <template v-for="(d, i) in route.darts" :key="i">
        <RouteDart :label="toLabel(d)" />
        <span v-if="i < route.darts.length - 1" class="route-card__sep">›</span>
      </template>
    </div>
  </section>
</template>

<style scoped>
.route-card {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 12px 14px;
}

.route-card__empty {
  font-family: var(--ds-font-mono);
  font-size: 14px;
  color: var(--ds-muted);
  font-style: italic;
  padding: 4px 0;
}

.route-card__darts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.route-card__sep {
  color: var(--ds-dim);
  font-family: var(--ds-font-mono);
  font-size: 14px;
}
</style>
