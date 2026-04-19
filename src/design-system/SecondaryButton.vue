<script setup lang="ts">
// Outlined secondary button — matches prototype ui.jsx SecondaryBtn().
interface Props {
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), { type: 'button' })

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button :type="type" class="secondary-btn" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<style scoped>
.secondary-btn {
  width: 100%;
  height: var(--ds-button-h);
  border: 1px solid var(--ds-border-2);
  border-radius: var(--ds-radius-lg);
  background: transparent;
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.12s,
    background 0.2s;
}

.secondary-btn:active {
  transform: scale(0.98);
}
</style>
