<script setup lang="ts">
// Brief confetti burst — 14 tiny red/green/white dots fly outward then fade.
// Activated by setting `active` true; it self-resolves after ~700ms.
// Matches prototype screens-play.jsx ConfettiBurst().
import { computed } from 'vue'

interface Props {
  active: boolean
}

const props = defineProps<Props>()

interface Bit {
  id: number
  angle: number
  dist: number
  color: string
  delay: number
  size: number
}

const bits = computed<Bit[]>(() => {
  if (!props.active) return []
  return Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    angle: (i / 14) * 360 + Math.random() * 20,
    dist: 80 + Math.random() * 60,
    color: i % 3 === 0 ? '#fff' : i % 2 === 0 ? 'var(--ds-accent)' : 'var(--ds-green)',
    delay: Math.random() * 100,
    size: 4 + Math.random() * 4,
  }))
})
</script>

<template>
  <div v-if="active" class="confetti" aria-hidden="true">
    <span
      v-for="b in bits"
      :key="b.id"
      class="confetti__bit"
      :style="{
        width: `${b.size}px`,
        height: `${b.size}px`,
        background: b.color,
        animationDelay: `${b.delay}ms`,
        '--angle': `${b.angle}deg`,
        '--dist': `${b.dist}px`,
      }"
    />
  </div>
</template>

<style scoped>
.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.confetti__bit {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: confetti-fly 700ms ease-out forwards;
}

@keyframes confetti-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: rotate(var(--angle)) translateY(calc(var(--dist) * -1)) scale(0.5);
  }
}

@media (prefers-reduced-motion: reduce) {
  .confetti__bit {
    animation: none;
    opacity: 0;
  }
}
</style>
