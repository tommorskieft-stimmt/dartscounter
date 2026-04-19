<script setup lang="ts">
// Segmented selector. Selected segment gets an accent background + glow.
// Matches prototype ui.jsx SegmentGroup().
type Value = string | number

interface Props {
  modelValue: Value
  options: Value[]
  disabledValues?: Value[]
}

withDefaults(defineProps<Props>(), { disabledValues: () => [] })

defineEmits<{ 'update:modelValue': [value: Value] }>()
</script>

<template>
  <div class="segments">
    <button
      v-for="opt in options"
      :key="String(opt)"
      :disabled="disabledValues.includes(opt)"
      class="segments__btn"
      :class="{
        'segments__btn--selected': modelValue === opt,
        'segments__btn--disabled': disabledValues.includes(opt),
      }"
      type="button"
      @click="!disabledValues.includes(opt) && $emit('update:modelValue', opt)"
    >
      {{ opt }}
    </button>
  </div>
</template>

<style scoped>
.segments {
  display: flex;
  gap: 6px;
  background: var(--ds-bg-2);
  padding: 4px;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
}

.segments__btn {
  flex: 1;
  height: var(--ds-button-sm-h);
  border: none;
  border-radius: var(--ds-radius-sm);
  background: transparent;
  color: var(--ds-text);
  font-family: var(--ds-font-mono);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.segments__btn--selected {
  background: var(--ds-accent);
  color: #fff;
  box-shadow: 0 0 16px var(--ds-accent-glow);
}

.segments__btn--disabled {
  color: var(--ds-dim);
  cursor: not-allowed;
}
</style>
