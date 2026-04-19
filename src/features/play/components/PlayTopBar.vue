<script setup lang="ts">
import { BackButton, Eyebrow } from '@/design-system'

interface Props {
  quitLabel?: string
  centerEyebrow?: string
  centerValue?: string
  rightEyebrow?: string
  rightValue?: string
  rightTone?: 'green' | 'red' | 'text'
}

withDefaults(defineProps<Props>(), {
  quitLabel: 'Quit',
  centerEyebrow: '',
  centerValue: '',
  rightEyebrow: '',
  rightValue: '',
  rightTone: 'text',
})

defineEmits<{ quit: [] }>()
</script>

<template>
  <div class="play-top">
    <BackButton :label="quitLabel" @click="$emit('quit')" />

    <div v-if="centerValue" class="play-top__center">
      <Eyebrow style="margin-bottom: 4px">{{ centerEyebrow }}</Eyebrow>
      <div class="play-top__value">{{ centerValue }}</div>
    </div>

    <div v-if="rightValue" class="play-top__right">
      <Eyebrow style="margin-bottom: 4px">{{ rightEyebrow }}</Eyebrow>
      <div
        class="play-top__value"
        :class="{
          'play-top__value--green': rightTone === 'green',
          'play-top__value--red': rightTone === 'red',
        }"
      >
        {{ rightValue }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.play-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
}

.play-top__center {
  text-align: center;
}

.play-top__right {
  text-align: right;
}

.play-top__value {
  font-family: var(--ds-font-mono);
  font-size: 18px;
  font-weight: 700;
  color: var(--ds-text);
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.play-top__value--green {
  color: var(--ds-green);
  text-shadow: 0 0 14px var(--ds-green-glow);
}

.play-top__value--red {
  color: var(--ds-accent);
  text-shadow: 0 0 14px var(--ds-accent-glow);
}
</style>
