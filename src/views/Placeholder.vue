<script setup lang="ts">
// Phase 00 placeholder — replaced by Home.vue in phase 02.
</script>

<template>
  <section class="placeholder">
    <h1 class="title">One·Two·One</h1>
    <p class="subtitle">Darts Practice · PWA scaffolding online</p>
    <p class="hint">Phase 00 · bootstrap</p>
  </section>
</template>

<style scoped>
.placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  text-align: center;
  padding: 2rem;
}

.title {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  color: var(--ds-text, #f4ece0);
}

.subtitle {
  margin: 0;
  color: rgba(244, 236, 224, 0.6);
}

.hint {
  margin: 0;
  font-family: var(--ds-font-mono, ui-monospace, monospace);
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(244, 236, 224, 0.35);
}
</style>
