<script setup lang="ts">
// JetBrains Mono 11 / medium / letter-spacing 2.5 / uppercase / muted
// Matches prototype ui.jsx Eyebrow()
</script>

<template>
  <div class="eyebrow">
    <slot />
  </div>
</template>

<style scoped>
.eyebrow {
  font-family: var(--ds-font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
}
</style>
