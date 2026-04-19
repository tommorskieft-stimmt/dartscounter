<script setup lang="ts">
// Full-width red button with red glow. Disabled state: dim grey, no glow.
// Matches prototype ui.jsx PrimaryBtn().
interface Props {
  disabled?: boolean
  glow?: boolean
  type?: 'button' | 'submit'
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  glow: true,
  type: 'button',
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="primary-btn"
    :class="{ 'primary-btn--glow': glow && !disabled, 'primary-btn--disabled': disabled }"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.primary-btn {
  width: 100%;
  height: var(--ds-button-h);
  border: none;
  border-radius: var(--ds-radius-lg);
  background: var(--ds-accent);
  color: #fff;
  font-family: var(--ds-font-display);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.12s,
    background 0.2s;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.primary-btn--glow {
  box-shadow:
    0 0 30px var(--ds-accent-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.primary-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.primary-btn--disabled {
  background: #28282c;
  color: var(--ds-dim);
  cursor: not-allowed;
  box-shadow: none;
}
</style>
