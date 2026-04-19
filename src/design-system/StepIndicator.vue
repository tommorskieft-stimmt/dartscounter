<script setup lang="ts">
// Progress dots for onboarding — matches prototype screens-onboarding.jsx.
interface Props {
  step: number
  total?: number
}

withDefaults(defineProps<Props>(), { total: 3 })
</script>

<template>
  <div class="step-indicator" role="progressbar" :aria-valuenow="step" :aria-valuemax="total">
    <span
      v-for="i in total"
      :key="i"
      class="step-indicator__dot"
      :class="{ 'step-indicator__dot--on': i <= step }"
    />
  </div>
</template>

<style scoped>
.step-indicator {
  display: flex;
  gap: 6px;
  margin-bottom: 28px;
}

.step-indicator__dot {
  flex: 1;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.3s;
}

.step-indicator__dot--on {
  background: var(--ds-accent);
  box-shadow: 0 0 8px var(--ds-accent-glow);
}
</style>
