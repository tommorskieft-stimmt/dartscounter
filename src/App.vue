<script setup lang="ts">
// Root shell — phase 00 scaffolding. Real layout arrives with the design
// system in phase 01.
</script>

<template>
  <main class="app-shell">
    <router-view />
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
