<script setup lang="ts">
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'
</script>

<template>
  <main class="app-shell">
    <router-view />
    <PwaUpdatePrompt />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100dvh;
  min-height: 100vh;
  background: var(--ds-app-bg, #14100d);
  color: var(--ds-text, #f4ece0);
  font-family: var(--ds-font-display, system-ui, sans-serif);
  display: flex;
  flex-direction: column;
}
</style>
