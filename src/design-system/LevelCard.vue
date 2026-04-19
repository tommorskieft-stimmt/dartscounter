<script setup lang="ts">
// Skill-level selector card used in onboarding step 3 and profile level sheet.
// Matches prototype screens-onboarding.jsx LevelCard().
interface Props {
  title: string
  description: string
  selected?: boolean
}

withDefaults(defineProps<Props>(), { selected: false })

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    class="level-card"
    :class="{ 'level-card--selected': selected }"
    @click="$emit('click', $event)"
  >
    <span class="level-card__radio" aria-hidden="true">
      <span v-if="selected" class="level-card__radio-dot" />
    </span>
    <span class="level-card__body">
      <span class="level-card__title">{{ title }}</span>
      <span class="level-card__desc">{{ description }}</span>
    </span>
  </button>
</template>

<style scoped>
.level-card {
  width: 100%;
  text-align: left;
  padding: 18px 20px;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  cursor: pointer;
  color: var(--ds-text);
  display: flex;
  align-items: center;
  gap: 14px;
  transition: all 0.15s;
}

.level-card--selected {
  background: rgba(229, 50, 40, 0.08);
  border-color: var(--ds-accent);
  box-shadow: 0 0 22px var(--ds-accent-glow);
}

.level-card__radio {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  flex-shrink: 0;
  border: 2px solid var(--ds-border-2);
  background: transparent;
  position: relative;
  display: inline-block;
  transition: all 0.15s;
}

.level-card--selected .level-card__radio {
  border-color: var(--ds-accent);
  background: var(--ds-accent);
}

.level-card__radio-dot {
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: #fff;
}

.level-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.level-card__title {
  font-family: var(--ds-font-display);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.level-card__desc {
  font-family: var(--ds-font-display);
  font-size: 13px;
  line-height: 1.35;
  color: var(--ds-muted);
}
</style>
