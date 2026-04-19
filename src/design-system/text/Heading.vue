<script setup lang="ts">
// Archivo / 32 default / 800 / line-height 1.02 / letter-spacing -0.8 / cream
// Matches prototype ui.jsx Heading()
interface Props {
  size?: number
}

withDefaults(defineProps<Props>(), { size: 32 })
</script>

<template>
  <div class="heading" :style="{ fontSize: `${size}px` }">
    <slot />
  </div>
</template>

<style scoped>
.heading {
  font-family: var(--ds-font-display);
  font-weight: 800;
  line-height: 1.02;
  letter-spacing: -0.8px;
  color: var(--ds-text);
}
</style>
