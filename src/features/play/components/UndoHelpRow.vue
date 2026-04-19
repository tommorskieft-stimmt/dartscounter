<script setup lang="ts">
interface Props {
  canUndo: boolean
}

defineProps<Props>()

defineEmits<{
  undo: []
  help: []
}>()
</script>

<template>
  <div class="uh">
    <button
      type="button"
      class="uh__btn uh__btn--undo"
      :class="{ 'uh__btn--disabled': !canUndo }"
      :disabled="!canUndo"
      @click="$emit('undo')"
    >
      <span class="uh__icon">↶</span>
      Undo
    </button>
    <button type="button" class="uh__btn uh__btn--help" @click="$emit('help')">
      <span class="uh__icon">?</span>
      Help
    </button>
  </div>
</template>

<style scoped>
.uh {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.uh__btn {
  flex: 1;
  height: 36px;
  border-radius: 9px;
  cursor: pointer;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
}

.uh__btn--undo {
  border: 1px solid var(--ds-border-2);
  color: var(--ds-text);
  background: rgba(244, 236, 224, 0.04);
}

.uh__btn--help {
  border: 1px solid var(--ds-green-dim);
  background: rgba(70, 160, 110, 0.06);
  color: var(--ds-green);
}

.uh__btn--disabled {
  cursor: not-allowed;
  color: var(--ds-dim);
  background: transparent;
}

.uh__icon {
  font-size: 13px;
}
</style>
