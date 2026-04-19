<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Eyebrow, PrimaryButton, SegmentGroup } from '@/design-system'

interface Props {
  dartsAvailable: number // how many darts left this round (for 121) or 3 otherwise
  eyebrow?: string
}

const props = withDefaults(defineProps<Props>(), { eyebrow: 'Enter Turn' })

const emit = defineEmits<{
  submit: [payload: { scoreThrown: number; dartsThrown: 1 | 2 | 3 }]
}>()

const dartsThrown = ref<1 | 2 | 3>(3)
const scoreInput = ref('')

const effDarts = computed<1 | 2 | 3>(() => {
  const n = Math.min(dartsThrown.value, props.dartsAvailable) as 1 | 2 | 3
  return n < 1 ? 1 : n
})

const maxScore = computed(() => 60 * effDarts.value)

const scoreNum = computed(() => {
  if (scoreInput.value === '') return Number.NaN
  const parsed = parseInt(scoreInput.value, 10)
  return Number.isNaN(parsed) ? Number.NaN : parsed
})

const scoreValid = computed(
  () =>
    !Number.isNaN(scoreNum.value) &&
    scoreNum.value >= 0 &&
    scoreNum.value <= maxScore.value,
)

const canSubmit = computed(() => scoreValid.value && effDarts.value > 0)

const disabledDartOpts = computed(() => {
  const out: number[] = []
  for (const n of [1, 2, 3]) {
    if (n > props.dartsAvailable) out.push(n)
  }
  return out
})

// Clamp `dartsThrown` if the available darts drop below the current pick.
watch(
  () => props.dartsAvailable,
  (available) => {
    if (dartsThrown.value > available) {
      dartsThrown.value = (Math.max(1, available) as 1 | 2 | 3) || 1
    }
  },
)

function submit() {
  if (!canSubmit.value) return
  emit('submit', { scoreThrown: scoreNum.value, dartsThrown: effDarts.value })
  scoreInput.value = ''
  dartsThrown.value = 3
}

function onScoreInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  scoreInput.value = el.value.replace(/[^0-9]/g, '').slice(0, 3)
}
</script>

<template>
  <div class="turn-input">
    <Eyebrow style="margin-bottom: 10px">{{ eyebrow }}</Eyebrow>

    <div class="turn-input__sublabel">Darts Thrown</div>
    <SegmentGroup
      v-model="dartsThrown"
      :options="[1, 2, 3]"
      :disabled-values="disabledDartOpts"
    />

    <div class="turn-input__sublabel turn-input__sublabel--gap">
      Score Thrown <span class="turn-input__hint">(max {{ maxScore }})</span>
    </div>

    <input
      class="turn-input__score"
      :class="{ 'turn-input__score--valid': scoreValid }"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :value="scoreInput"
      placeholder="0"
      @input="onScoreInput"
      @keydown.enter="submit"
    />

    <div style="margin-top: 12px">
      <PrimaryButton :disabled="!canSubmit" @click="submit">Submit Turn</PrimaryButton>
    </div>
  </div>
</template>

<style scoped>
.turn-input {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 14px;
}

.turn-input__sublabel {
  font-family: var(--ds-font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-dim);
  margin-bottom: 6px;
}

.turn-input__sublabel--gap {
  margin-top: 14px;
}

.turn-input__hint {
  color: var(--ds-muted);
}

.turn-input__score {
  width: 100%;
  height: var(--ds-button-h);
  box-sizing: border-box;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-border);
  border-radius: 10px;
  padding: 0 16px;
  color: var(--ds-text);
  font-family: var(--ds-font-mono);
  font-size: 24px;
  font-weight: 700;
  outline: none;
  text-align: center;
  caret-color: var(--ds-accent);
  letter-spacing: -1px;
  transition: border 0.15s;
}

.turn-input__score--valid {
  border-color: var(--ds-accent-dim);
}

.turn-input__score:focus-visible {
  border-color: var(--ds-accent);
}
</style>
