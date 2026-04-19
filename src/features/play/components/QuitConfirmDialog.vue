<script setup lang="ts">
// Three-way prompt when the user taps Quit mid-game: save the partial
// match to history, discard it, or keep playing. If the match hasn't
// produced anything worth saving yet (`hasProgress === false`), the
// consumer should skip this dialog and quit silently.
import { BodyText, Heading, PrimaryButton, SecondaryButton } from '@/design-system'

interface Props {
  open: boolean
  /**
   * Short description of what would be saved. e.g. "3 rounds played" or
   * "1 leg finished". Consumer-supplied so each mode phrases it right.
   */
  progressLabel: string
}

defineProps<Props>()

defineEmits<{
  save: []
  discard: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="quit-backdrop" @click.self="$emit('cancel')">
      <div class="quit-card" role="dialog" aria-modal="true">
        <Heading :size="24" style="margin-bottom: 8px">Leaving mid-game</Heading>
        <BodyText style="margin-bottom: 6px">{{ progressLabel }}</BodyText>
        <BodyText style="margin-bottom: 22px; font-size: 14px">
          Save this partial match to your stats, or discard it?
        </BodyText>
        <div class="quit-card__row">
          <SecondaryButton style="flex: 1" @click="$emit('cancel')">Keep playing</SecondaryButton>
          <SecondaryButton style="flex: 1" @click="$emit('discard')">Discard</SecondaryButton>
        </div>
        <div style="margin-top: 10px">
          <PrimaryButton :glow="true" @click="$emit('save')">Save &amp; exit</PrimaryButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.quit-backdrop {
  position: fixed;
  inset: 0;
  background: var(--ds-backdrop-bg);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.quit-card {
  width: 100%;
  max-width: 420px;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border-2);
  border-radius: var(--ds-radius-xl);
  padding: 24px 24px 22px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  max-height: calc(100dvh - 48px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.quit-card__row {
  display: flex;
  gap: 10px;
}
</style>
