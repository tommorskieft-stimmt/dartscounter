<script setup lang="ts">
// Big mono number with a brief flip-out → flip-in transition whenever
// the value changes. Used for the scoreboard remaining-score.
// Matches prototype screens-play.jsx FlipNumber().
import { ref, watch } from 'vue'

interface Props {
  value: number
  size?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 88,
  color: '#fff',
})

const display = ref(props.value)
const flipping = ref(false)

watch(
  () => props.value,
  (next) => {
    if (next === display.value) return
    flipping.value = true
    window.setTimeout(() => {
      display.value = next
      flipping.value = false
    }, 120)
  },
)
</script>

<template>
  <span
    class="flip-number"
    :class="{ 'flip-number--flipping': flipping }"
    :style="{ fontSize: `${size}px`, color }"
  >
    {{ display }}
  </span>
</template>

<style scoped>
.flip-number {
  font-family: var(--ds-font-mono);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -3px;
  transition: all 0.12s ease;
  display: inline-block;
}

.flip-number--flipping {
  transform: translateY(-6px) scale(0.95);
  opacity: 0.4;
}
</style>
