<script setup lang="ts">
// Single dart pill for the checkout-route display (e.g. T20 / D16 / BULL).
// Matches prototype screens-play.jsx RouteDart().
import { computed } from 'vue'

interface Props {
  label: string
}

const props = defineProps<Props>()

const variant = computed<'double' | 'treble' | 'single'>(() => {
  if (props.label.startsWith('D') || props.label === 'BULL') return 'double'
  if (props.label.startsWith('T')) return 'treble'
  return 'single'
})
</script>

<template>
  <span
    class="route-dart"
    :class="{
      'route-dart--double': variant === 'double',
      'route-dart--treble': variant === 'treble',
    }"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.route-dart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 38px;
  padding: 0 10px;
  border-radius: var(--ds-radius-sm);
  background: rgba(244, 236, 224, 0.05);
  border: 1px solid var(--ds-border-2);
  font-family: var(--ds-font-mono);
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.route-dart--double {
  background: rgba(70, 160, 110, 0.14);
  border-color: var(--ds-green-dim);
}

.route-dart--treble {
  background: rgba(229, 50, 40, 0.14);
  border-color: var(--ds-accent-dim);
}
</style>
