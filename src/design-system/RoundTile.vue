<script setup lang="ts">
// Small tile in the Round-by-Round grid on the Game Over screen.
// Green tint for success, red for miss. Selected state adds a brass
// border + glow. Matches prototype screens-over.jsx RoundTile.
interface Props {
  target: number | string
  success: boolean
  detail: string
  selected?: boolean
}

withDefaults(defineProps<Props>(), { selected: false })

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="round-tile"
    :class="{
      'round-tile--success': success,
      'round-tile--fail': !success,
      'round-tile--selected': selected,
    }"
    @click="$emit('click')"
  >
    <span class="round-tile__target">{{ target }}</span>
    <span class="round-tile__detail">{{ detail }}</span>
  </button>
</template>

<style scoped>
.round-tile {
  position: relative;
  padding: 8px 6px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-height: 48px;
  border-radius: 9px;
  transition: all 0.15s;
}

.round-tile--success {
  background: rgba(70, 160, 110, 0.12);
  border: 1px solid var(--ds-green-dim);
}

.round-tile--fail {
  background: rgba(229, 50, 40, 0.06);
  border: 1px solid var(--ds-accent-dim);
}

.round-tile--selected {
  border-color: var(--ds-brass);
  box-shadow: 0 0 10px var(--ds-accent-glow);
}

.round-tile__target {
  font-family: var(--ds-font-mono);
  font-size: 12px;
  font-weight: 700;
  color: var(--ds-text);
  letter-spacing: -0.5px;
}

.round-tile__detail {
  font-family: var(--ds-font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.round-tile--success .round-tile__detail {
  color: var(--ds-green);
}

.round-tile--fail .round-tile__detail {
  color: var(--ds-accent);
}
</style>
