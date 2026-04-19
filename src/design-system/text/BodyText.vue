<script setup lang="ts">
// Archivo 15 / regular / line-height 1.45 / muted
// Matches prototype ui.jsx Body()
interface Props {
  size?: number
}

withDefaults(defineProps<Props>(), { size: 15 })
</script>

<template>
  <p class="body-text" :style="{ fontSize: `${size}px` }">
    <slot />
  </p>
</template>

<style scoped>
.body-text {
  font-family: var(--ds-font-display);
  font-weight: 400;
  line-height: 1.45;
  color: var(--ds-muted);
  margin: 0;
}
</style>
