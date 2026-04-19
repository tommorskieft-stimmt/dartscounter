<script setup lang="ts">
// App-themed text input with an optional monospace uppercase label.
// Matches prototype ui.jsx TextField().
interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'date'
  inputmode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'search'
  maxlength?: number
  autofocus?: boolean
  caretAccent?: 'red' | 'green'
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  placeholder: '',
  type: 'text',
  inputmode: 'text',
  maxlength: undefined,
  autofocus: false,
  caretAccent: 'red',
})

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="field">
    <label v-if="label" class="field__label">{{ label }}</label>
    <input
      class="field__input"
      :class="{ 'field__input--caret-green': caretAccent === 'green' }"
      :type="type"
      :inputmode="inputmode"
      :value="modelValue"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :autofocus="autofocus"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.field__label {
  display: block;
  font-family: var(--ds-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 8px;
}

.field__input {
  width: 100%;
  height: var(--ds-input-h);
  box-sizing: border-box;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 0 16px;
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  font-size: 17px;
  font-weight: 500;
  outline: none;
  transition: border 0.15s;
  caret-color: var(--ds-accent);
}

.field__input--caret-green {
  caret-color: var(--ds-green);
}

.field__input:focus-visible {
  border-color: var(--ds-accent);
  outline: none;
}

.field__input--caret-green:focus-visible {
  border-color: var(--ds-green);
}
</style>
