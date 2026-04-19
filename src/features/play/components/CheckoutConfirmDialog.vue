<script setup lang="ts">
// Opens when the user's turn brings remaining to 0. They pick how many
// darts they actually threw; we auto-derive the max feasible "darts on a
// double" from the score and default to that (the user can still dial it
// down if some of their darts were singles/trebles).
//
// Feasibility rule: K doubles in a turn scoring S from N darts is valid
// iff there exist K doubles (each even, 2..40) and (N-K) non-doubles
// (each 0..60 integer) summing to S, with the last dart being a double
// (hence K ≥ 1 for a valid checkout). When K = N, sum(doubles) must be
// even and within [2K, 40K]. When K < N we also need the remaining
// amount (S − doubles_sum) to fall in [0, 60·(N−K)] for some even
// doubles_sum in [2K, 40K].
//
// UX: the backdrop does NOT dismiss on click — accidental taps would
// lose the score the user just entered. Only the explicit Back button
// cancels. No `backdrop-filter` either (iOS Safari's stacking-context
// quirks with filter were eating button taps).
import { computed, ref, watch } from 'vue'
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
const userTouchedDoubles = ref(false)

function feasibleDoubles(score: number, nDarts: 1 | 2 | 3, k: 0 | 1 | 2 | 3): boolean {
  if (k > nDarts) return false
  if (k < 1) return false
  if (k === nDarts) {
    return score % 2 === 0 && score >= 2 * k && score <= 40 * k
  }
  const maxDoubles = 40 * k
  const minDoubles = 2 * k
  const maxNon = 60 * (nDarts - k)
  const lower = Math.max(minDoubles, score - maxNon)
  const upper = Math.min(maxDoubles, score)
  if (lower > upper) return false
  const firstEven = lower % 2 === 0 ? lower : lower + 1
  return firstEven <= upper
}

function maxDoublesFor(score: number, nDarts: 1 | 2 | 3): 0 | 1 | 2 | 3 {
  for (const k of [3, 2, 1] as const) {
    if (k <= nDarts && feasibleDoubles(score, nDarts, k)) return k
  }
  return 0
}

const maxDoubles = computed(() => maxDoublesFor(props.score, darts.value))
const doublesOptions = computed(() => [0, 1, 2, 3].slice(0, darts.value + 1))
const doublesDisabled = computed(() => [0, 1, 2, 3].filter((k) => k > maxDoubles.value))

watch(
  () => props.open,
  (open) => {
    if (!open) return
    darts.value = 3
    userTouchedDoubles.value = false
    doubles.value = maxDoublesFor(props.score, 3)
  },
)

watch(darts, (n) => {
  if (userTouchedDoubles.value) {
    const maxK = maxDoublesFor(props.score, n)
    if (doubles.value > maxK) doubles.value = maxK
    return
  }
  doubles.value = maxDoublesFor(props.score, n)
})

function onDoublesChange(value: string | number) {
  doubles.value = value as 0 | 1 | 2 | 3
  userTouchedDoubles.value = true
}

function confirm() {
  emit('confirm', { darts: darts.value, doubles: doubles.value })
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="ck-backdrop">
      <div class="ck-card" role="dialog" aria-modal="true">
        <Eyebrow style="margin-bottom: 6px; color: var(--ds-green)">Checkout?</Eyebrow>
        <Heading :size="26" style="margin-bottom: 6px">You scored {{ score }}</Heading>
        <BodyText style="margin-bottom: 20px; font-size: 14px">
          Confirm the finish. The last dart must land on a double (bull counts).
        </BodyText>

        <div class="ck-card__label">Darts thrown this turn</div>
        <SegmentGroup v-model="darts" :options="[1, 2, 3]" style="margin-bottom: 14px" />

        <div class="ck-card__label">Darts on a double</div>
        <SegmentGroup
          :model-value="doubles"
          :options="doublesOptions"
          :disabled-values="doublesDisabled"
          @update:model-value="onDoublesChange"
        />
        <p class="ck-card__hint">
          {{
            doubles === 0
              ? 'No doubles — this counts as a bust.'
              : `Leg finished in ${darts} dart${darts === 1 ? '' : 's'} · ${doubles} on a double.`
          }}
        </p>

        <div class="ck-card__actions">
          <SecondaryButton style="flex: 1" @click="$emit('cancel')">Back</SecondaryButton>
          <PrimaryButton style="flex: 1" :glow="doubles > 0" @click="confirm">
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
  background: var(--ds-backdrop-bg);
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
  box-sizing: border-box;
  max-height: calc(100dvh - 48px);
  max-height: calc(100vh - 48px);
  overflow-y: auto;
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
