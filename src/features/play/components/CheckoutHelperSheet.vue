<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { BodyText, BottomSheet, Eyebrow, RouteDart } from '@/design-system'
import { route as routeFor } from '@/game/CheckoutEngine'
import { toLabel } from '@/game/DartNotation'

// Enter a remaining score, get the best checkout shown. No dart-count
// field — the route from the chart is always the shortest finish.
interface Props {
  open: boolean
}

const props = defineProps<Props>()

defineEmits<{ close: [] }>()

const remainingInput = ref('')

watch(
  () => props.open,
  (open) => {
    if (!open) return
    remainingInput.value = ''
  },
)

const remNum = computed(() => {
  if (remainingInput.value === '') return Number.NaN
  return parseInt(remainingInput.value, 10)
})

const valid = computed(
  () => !Number.isNaN(remNum.value) && remNum.value >= 0 && remNum.value <= 170,
)

const helperRoute = computed(() => (valid.value ? routeFor(remNum.value) : null))

const helperLabel = computed(() => {
  const r = helperRoute.value
  if (!r) return null
  if (r.kind === 'done') return '— checked out —'
  if (r.kind === 'bust') return 'must be ≥ 2'
  if (r.kind === 'noOut') return 'no out shot'
  return null
})

function onRemInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  remainingInput.value = el.value.replace(/[^0-9]/g, '').slice(0, 3)
}
</script>

<template>
  <BottomSheet :open="open" accent="green" @close="$emit('close')">
    <div class="helper__head">
      <Eyebrow style="color: var(--ds-green)">Checkout Helper</Eyebrow>
      <button class="helper__x" type="button" @click="$emit('close')">✕</button>
    </div>
    <BodyText style="font-size: 13px; margin-bottom: 14px">
      Enter your remaining score — we'll show the shortest finish.
    </BodyText>

    <div class="helper__sublabel">Remaining score</div>
    <input
      class="helper__input"
      :class="{ 'helper__input--valid': valid }"
      type="text"
      inputmode="numeric"
      pattern="[0-9]*"
      :value="remainingInput"
      placeholder="e.g. 80"
      autofocus
      @input="onRemInput"
    />

    <div class="helper__result">
      <Eyebrow style="margin-bottom: 8px; color: var(--ds-green)">Suggested route</Eyebrow>
      <div v-if="!valid" class="helper__placeholder">Enter a score between 0 and 170.</div>
      <div v-else-if="helperLabel" class="helper__placeholder">{{ helperLabel }}</div>
      <div v-else-if="helperRoute && helperRoute.kind === 'route'">
        <div class="helper__darts">
          <template v-for="(d, i) in helperRoute.darts" :key="i">
            <RouteDart :label="toLabel(d)" />
            <span v-if="i < helperRoute.darts.length - 1" class="helper__sep">›</span>
          </template>
        </div>
        <div class="helper__meta">
          Finish in {{ helperRoute.darts.length }} dart{{
            helperRoute.darts.length === 1 ? '' : 's'
          }}
        </div>
      </div>
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
  margin-bottom: 12px;
}

.helper__input--valid {
  border-color: var(--ds-green-dim);
}

.helper__input:focus-visible {
  border-color: var(--ds-green);
}

.helper__result {
  margin-top: 18px;
  padding: 14px 16px;
  background: var(--ds-bg-3);
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-green-dim);
  min-height: 68px;
}

.helper__placeholder {
  font-family: var(--ds-font-mono);
  font-size: 14px;
  color: var(--ds-muted);
  font-style: italic;
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

.helper__meta {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--ds-dim);
  text-transform: uppercase;
}
</style>
