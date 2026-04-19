<script setup lang="ts">
// Full-width bottom sheet with a grab handle, slide-up animation, and a
// dismiss-on-backdrop-click behaviour. Accent is 'red' by default (LevelSheet),
// 'green' for the Checkout Helper sheet.
// Matches prototype LevelSheet + HelpModal chrome.
interface Props {
  open: boolean
  accent?: 'red' | 'green' | 'neutral'
}

withDefaults(defineProps<Props>(), { accent: 'neutral' })

defineEmits<{ close: [] }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="sheet__backdrop"
        @click="$emit('close')"
      >
        <div
          class="sheet"
          :class="{
            'sheet--green': accent === 'green',
            'sheet--red': accent === 'red',
          }"
          @click.stop
        >
          <span class="sheet__grabber" aria-hidden="true" />
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet__backdrop {
  position: fixed;
  inset: 0;
  background: var(--ds-backdrop-bg);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.sheet {
  width: 100%;
  background: var(--ds-bg-2);
  border-top-left-radius: var(--ds-radius-sheet);
  border-top-right-radius: var(--ds-radius-sheet);
  padding: 20px 20px 30px;
  border-top: 1px solid var(--ds-border-2);
}

.sheet--green {
  border-top-color: var(--ds-green-dim);
  box-shadow: 0 -10px 40px var(--ds-green-glow);
}

.sheet--red {
  border-top-color: var(--ds-accent-dim);
  box-shadow: 0 -10px 40px var(--ds-accent-glow);
}

.sheet__grabber {
  display: block;
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--ds-border-2);
  margin: 0 auto 18px;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.25s ease;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
