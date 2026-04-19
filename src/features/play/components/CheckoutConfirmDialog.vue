<script setup lang="ts">
// Opens when the user's turn would bring remaining to 0. They confirm
// how many darts they threw this turn and how many landed on the double.
// On confirm with ≥1 double → leg finishes. On confirm with 0 doubles →
// bust (the rule: last dart must be on a double). Cancel reverts the
// input so they can correct the score.
import { ref, watch } from 'vue'
import { BodyText, Eyebrow, Heading, PrimaryButton, SecondaryButton, SegmentGroup } from '@/design-system'

interface Props {
  open: boolean
  score: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  confirm: [payload: { darts: 1 | 2 | 3; doubles: 0 | 1 | 2 | 3 }]
  cancel: []
}>()

const darts = ref<1 | 2 | 3>(3)
const doubles = ref<0 | 1 | 2 | 3>(1)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    darts.value = 3
    doubles.value = 1
  },
)

function confirm() {
  emit('confirm', { darts: darts.value, doubles: doubles.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ck-backdrop" @click.self="$emit('cancel')">
      <div class="ck-card" role="dialog" aria-modal="true">
        <Eyebrow style="margin-bottom: 6px; color: var(--ds-green)">Checkout?</Eyebrow>
        <Heading :size="26" style="margin-bottom: 8px">You scored {{ score }}</Heading>
        <BodyText style="margin-bottom: 20px; font-size: 14px">
          Confirm the finish. The last dart must land on a double (bull counts).
        </BodyText>

        <div class="ck-card__label">Darts thrown this turn</div>
        <SegmentGroup v-model="darts" :options="[1, 2, 3]" style="margin-bottom: 14px" />

        <div class="ck-card__label">Darts on a double</div>
        <SegmentGroup
          v-model="doubles"
          :options="[0, 1, 2, 3]"
          :disabled-values="doubles > darts ? [] : []"
        />
        <p class="ck-card__hint">
          {{ doubles === 0 ? 'No doubles — this turn busts.' : `Leg finished in ${darts} dart${darts === 1 ? '' : 's'}.` }}
        </p>

        <div class="ck-card__actions">
          <SecondaryButton style="flex: 1" @click="$emit('cancel')">Back</SecondaryButton>
          <PrimaryButton
            style="flex: 1"
            :glow="doubles > 0"
            @click="confirm"
          >
            {{ doubles === 0 ? 'Record bust' : 'Confirm' }}
          </PrimaryButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.ck-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 260;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.ck-card {
  width: 100%;
  max-width: 420px;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-green-dim);
  border-radius: var(--ds-radius-xl);
  padding: 22px 24px 20px;
  box-shadow: 0 0 40px var(--ds-green-glow);
}

.ck-card__label {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 8px;
}

.ck-card__hint {
  margin: 10px 0 0;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--ds-dim);
}

.ck-card__actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}
</style>
