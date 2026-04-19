<script setup lang="ts">
// Single-line stat block used in 2-column grids on Profile / Stats / Over.
// Matches prototype screens-home.jsx StatTile().
interface Props {
  label: string
  value: string | number | null | undefined
  mono?: boolean
}

withDefaults(defineProps<Props>(), { mono: true })
</script>

<template>
  <div class="stat-tile">
    <div class="stat-tile__label">{{ label }}</div>
    <div class="stat-tile__value" :class="{ 'stat-tile__value--mono': mono }">
      {{ value ?? '—' }}
    </div>
  </div>
</template>

<style scoped>
.stat-tile {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 14px 14px 16px;
}

.stat-tile__label {
  font-family: var(--ds-font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 6px;
}

.stat-tile__value {
  font-family: var(--ds-font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--ds-text);
  letter-spacing: -0.5px;
  line-height: 1;
}

.stat-tile__value--mono {
  font-family: var(--ds-font-mono);
}
</style>
