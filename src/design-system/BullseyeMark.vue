<script setup lang="ts">
// Dartboard-inspired bullseye glyph — alternating red/green dashed rings
// around a bullseye core. Hero element on Home and in app icon.
// Matches prototype screens-home.jsx BullseyeMark().
interface Props {
  size?: number
}

withDefaults(defineProps<Props>(), { size: 52 })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 52 52"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="bullseyeGlow">
        <stop offset="0%" stop-color="var(--ds-accent)" stop-opacity="0.5" />
        <stop offset="60%" stop-color="var(--ds-green)" stop-opacity="0.15" />
        <stop offset="100%" stop-color="var(--ds-accent)" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="26" cy="26" r="24" fill="url(#bullseyeGlow)" />
    <!-- Double ring (alternating red/green dashes) -->
    <circle
      cx="26"
      cy="26"
      r="22"
      fill="none"
      stroke="var(--ds-accent-dim)"
      stroke-width="2.4"
      stroke-opacity="0.5"
      stroke-dasharray="5 5"
    />
    <circle
      cx="26"
      cy="26"
      r="22"
      fill="none"
      stroke="var(--ds-green-dim)"
      stroke-width="2.4"
      stroke-opacity="0.5"
      stroke-dasharray="5 5"
      stroke-dashoffset="5"
    />
    <!-- Mid ring -->
    <circle
      cx="26"
      cy="26"
      r="15"
      fill="none"
      stroke="rgba(244, 236, 224, 0.18)"
      stroke-width="1"
    />
    <!-- Bullseye core -->
    <circle cx="26" cy="26" r="8" fill="var(--ds-green)" opacity="0.8" />
    <circle cx="26" cy="26" r="4" fill="var(--ds-accent)" />
    <circle cx="26" cy="26" r="1.6" fill="#fff" />
  </svg>
</template>
