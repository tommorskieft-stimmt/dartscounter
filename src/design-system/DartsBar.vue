<script setup lang="ts">
// Progress bar of darts thrown — alternating red/green segments like a board.
// Matches prototype screens-play.jsx DartsBar().
interface Props {
  used: number
  max: number
}

defineProps<Props>()
</script>

<template>
  <div class="darts-bar" role="progressbar" :aria-valuenow="used" :aria-valuemax="max">
    <span
      v-for="i in max"
      :key="i"
      class="darts-bar__seg"
      :class="{
        'darts-bar__seg--filled': i <= used,
        'darts-bar__seg--accent': (i - 1) % 2 === 0,
        'darts-bar__seg--green': (i - 1) % 2 === 1,
      }"
    />
  </div>
</template>

<style scoped>
.darts-bar {
  display: flex;
  gap: 3px;
  width: 100%;
  height: 6px;
}

.darts-bar__seg {
  flex: 1;
  height: 100%;
  border-radius: 2px;
  background: rgba(244, 236, 224, 0.08);
  transition: background 0.3s;
}

.darts-bar__seg--filled.darts-bar__seg--accent {
  background: var(--ds-accent);
  box-shadow: 0 0 6px var(--ds-accent-glow);
}

.darts-bar__seg--filled.darts-bar__seg--green {
  background: var(--ds-green);
  box-shadow: 0 0 6px var(--ds-green-glow);
}
</style>
