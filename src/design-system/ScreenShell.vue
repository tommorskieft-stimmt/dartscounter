<script setup lang="ts">
// Shared screen scaffold — flex column, content area, optional footer band.
// Matches prototype screens-onboarding.jsx ScreenShell().
interface Props {
  padding?: string
}

withDefaults(defineProps<Props>(), { padding: '72px 24px 40px' })
</script>

<template>
  <section class="screen" :style="{ padding }">
    <div class="screen__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="screen__footer">
      <slot name="footer" />
    </div>
  </section>
</template>

<style scoped>
.screen {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.screen__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.screen__footer {
  margin-top: 24px;
}
</style>
