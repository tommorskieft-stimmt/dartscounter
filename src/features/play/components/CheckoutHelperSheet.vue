<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BodyText, BottomSheet, Eyebrow, RouteDart } from '@/design-system'
import { route as routeFor } from '@/game/CheckoutEngine'
import { toLabel } from '@/game/DartNotation'

// You enter what you *just threw* (e.g. 20) and we show the checkout for
// `currentRemaining - thrown` (your new remaining). No dart-count field
// — the chart always returns the shortest finish.
interface Props {
  open: boolean
  currentRemaining: number
}

const props = defineProps<Props>()

defineEmits<{ close: [] }>()

const thrownInput = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    thrownInput.value = ''
  },
)

const thrownNum = computed(() => {
  if (thrownInput.value === '') return Number.NaN
  return parseInt(thrownInput.value, 10)
})

const thrownValid = computed(
  () => !Number.isNaN(thrownNum.value) && thrownNum.value >= 0 && thrownNum.value <= 180,
)

const newRemaining = computed(() => {
  if (!thrownValid.value) return null
  return props.currentRemaining - thrownNum.value
})

const helperRoute = computed(() =>
  newRemaining.value === null ? null : routeFor(newRemaining.value),
)

const helperLabel = computed(() => {
  const r = helperRoute.value
  if (!r) return null
  if (r.kind === 'done') return '— checked out —'
  if (r.kind === 'bust') return 'must be ≥ 2 · reset'
  if (r.kind === 'noOut') return 'no out shot'
  return null
})

function onInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  thrownInput.value = el.value.replace(/[^0-9]/g, '').slice(0, 3)
}
</script>

<template>
  <BottomSheet :open="open" accent="green" @close="$emit('close')">
    <div class="helper__head">
      <Eyebrow style="color: var(--ds-green)">Checkout Helper</Eyebrow>
      <button class="helper__x" type="button" @click="$emit('close')">✕</button>
    </div>
    <BodyText style="font-size: 13px; margin-bottom: 14px">
      Enter what you just threw — we'll show the best finish from what's left.
    </BodyText>

    <div class="helper__meta-row">
      <span class="helper__meta-label">Remaining now</span>
      <span class="helper__meta-value">{{ currentRemaining }}</span>
    </div>

    <div class="helper__sublabel">Score you threw</div>
    <input
      class="helper__input"
      :class="{ 'helper__input--valid': thrownValid }"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :value="thrownInput"
      placeholder="e.g. 20"
      autofocus
      @input="onInput"
    />

    <div class="helper__result">
      <Eyebrow style="margin-bottom: 4px; color: var(--ds-green)">After that throw</Eyebrow>
      <div v-if="!thrownValid" class="helper__placeholder">
        Enter a number between 0 and 180.
      </div>
      <template v-else>
        <div class="helper__new-remaining">
          Remaining <span class="helper__new-remaining-val">{{ newRemaining }}</span>
        </div>
        <div v-if="helperLabel" class="helper__placeholder">{{ helperLabel }}</div>
        <div v-else-if="helperRoute && helperRoute.kind === 'route'">
          <Eyebrow style="margin: 10px 0 6px; color: var(--ds-green)">Suggested route</Eyebrow>
          <div class="helper__darts">
            <template v-for="(d, i) in helperRoute.darts" :key="i">
              <RouteDart :label="toLabel(d)" />
              <span v-if="i < helperRoute.darts.length - 1" class="helper__sep">›</span>
            </template>
          </div>
          <div class="helper__caption">
            Finish in {{ helperRoute.darts.length }} dart{{
              helperRoute.darts.length === 1 ? '' : 's'
            }}
          </div>
        </div>
      </template>
    </div>
  </BottomSheet>
</template>

<style scoped>
.helper__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.helper__x {
  background: none;
  border: none;
  color: var(--ds-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
}

.helper__meta-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 10px 14px;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  margin-bottom: 14px;
}

.helper__meta-label {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
}

.helper__meta-value {
  font-family: var(--ds-font-mono);
  font-size: 22px;
  font-weight: 800;
  color: var(--ds-text);
  letter-spacing: -1px;
}

.helper__sublabel {
  font-family: var(--ds-font-mono);
  font-size: 9px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-dim);
  margin-bottom: 6px;
}

.helper__input {
  width: 100%;
  height: var(--ds-input-h);
  box-sizing: border-box;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-border);
  border-radius: 10px;
  padding: 0 16px;
  color: var(--ds-text);
  font-family: var(--ds-font-mono);
  font-size: 22px;
  font-weight: 700;
  outline: none;
  text-align: center;
  caret-color: var(--ds-green);
  letter-spacing: -1px;
  transition: border 0.15s;
  margin-bottom: 14px;
}

.helper__input--valid {
  border-color: var(--ds-green-dim);
}

.helper__input:focus-visible {
  border-color: var(--ds-green);
}

.helper__result {
  padding: 14px 16px;
  background: var(--ds-bg-3);
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-green-dim);
  min-height: 84px;
}

.helper__new-remaining {
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.helper__new-remaining-val {
  font-size: 22px;
  font-weight: 800;
  color: var(--ds-green);
  letter-spacing: -1px;
}

.helper__placeholder {
  font-family: var(--ds-font-mono);
  font-size: 13px;
  color: var(--ds-muted);
  font-style: italic;
  margin-top: 8px;
}

.helper__darts {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  align-items: center;
}

.helper__sep {
  color: var(--ds-dim);
  font-family: var(--ds-font-mono);
  font-size: 14px;
}

.helper__caption {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--ds-dim);
  text-transform: uppercase;
}
</style>
