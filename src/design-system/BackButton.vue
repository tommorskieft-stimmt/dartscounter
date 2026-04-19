<script setup lang="ts">
// Chevron back button for top-left of screens — prototype ui.jsx BackBtn().
interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), { label: 'BACK' })

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button class="back-btn" @click="$emit('click', $event)">
    <span class="back-btn__chevron" aria-hidden="true">◂</span>
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
.back-btn {
  background: transparent;
  border: none;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--ds-muted);
  font-family: var(--ds-font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.back-btn__chevron {
  font-size: 14px;
  line-height: 1;
}
</style>
