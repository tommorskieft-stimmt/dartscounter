<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  BackButton,
  BodyText,
  Eyebrow,
  Heading,
  PrimaryButton,
  SegmentGroup,
} from '@/design-system'
import {
  DEFAULT_BARNEYS,
  DEFAULT_CHECKOUT_121,
  GAME_MODE_DISPLAY,
  type GameMode,
} from '@/game/GameMode'
import type { GameType } from '@/types/domain'
import { usePlayConfigStore } from '@/stores/playConfig'

const router = useRouter()
const playConfig = usePlayConfigStore()

type ScorePreset = 201 | 301 | 501 | 'custom'
type LegsPreset = 1 | 3 | 5 | 'custom'

interface State {
  mode: GameType
  // 121
  maxDarts: number
  rounds: 10 | 25 | 'endless'
  // Standard
  scorePreset: ScorePreset
  customScore: string
  legsPreset: LegsPreset
  customLegs: string
}

const state = reactive<State>({
  mode: 'checkout121',
  maxDarts: DEFAULT_CHECKOUT_121.maxDarts,
  rounds: (DEFAULT_CHECKOUT_121.rounds ?? 10) as 10,
  scorePreset: 501,
  customScore: '',
  legsPreset: 1,
  customLegs: '',
})

const display = computed(() => GAME_MODE_DISPLAY[state.mode])

const customScoreNum = computed(() => {
  const n = parseInt(state.customScore || '', 10)
  return Number.isFinite(n) ? n : Number.NaN
})

const customLegsNum = computed(() => {
  const n = parseInt(state.customLegs || '', 10)
  return Number.isFinite(n) ? n : Number.NaN
})

const customScoreValid = computed(
  () => customScoreNum.value >= 2 && customScoreNum.value <= 999,
)
const customLegsValid = computed(
  () => customLegsNum.value >= 1 && customLegsNum.value <= 99,
)

const resolvedStartScore = computed(() => {
  if (state.scorePreset === 'custom') {
    return customScoreValid.value ? customScoreNum.value : null
  }
  return state.scorePreset
})

const resolvedLegs = computed(() => {
  if (state.legsPreset === 'custom') {
    return customLegsValid.value ? customLegsNum.value : null
  }
  return state.legsPreset
})

const canStart = computed(() => {
  if (state.mode !== 'standardCheckout') return true
  return resolvedStartScore.value !== null && resolvedLegs.value !== null
})

function startGame() {
  if (!canStart.value) return
  let mode: GameMode
  switch (state.mode) {
    case 'checkout121':
      mode = {
        type: 'checkout121',
        maxDarts: state.maxDarts,
        rounds: state.rounds === 'endless' ? null : state.rounds,
      }
      break
    case 'standardCheckout':
      mode = {
        type: 'standardCheckout',
        startScore: resolvedStartScore.value as number,
        legs: resolvedLegs.value,
      }
      break
    case 'barneys':
      mode = DEFAULT_BARNEYS
      break
  }
  playConfig.set(mode)
  router.push({ name: 'play-live' })
}

function onCustomScoreInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  state.customScore = el.value.replace(/[^0-9]/g, '').slice(0, 3)
}

function onCustomLegsInput(ev: Event) {
  const el = ev.target as HTMLInputElement
  state.customLegs = el.value.replace(/[^0-9]/g, '').slice(0, 2)
}
</script>

<template>
  <section class="setup">
    <div class="setup__back">
      <BackButton label="Home" @click="router.push({ name: 'home' })" />
    </div>

    <Heading :size="32" style="margin-bottom: 10px">Play</Heading>
    <BodyText style="margin-bottom: 24px">Pick a drill and configure the rules.</BodyText>

    <Eyebrow style="margin-bottom: 10px">Game mode</Eyebrow>
    <div class="setup__modes">
      <button
        v-for="id in (['checkout121', 'standardCheckout', 'barneys'] as GameType[])"
        :key="id"
        type="button"
        class="setup__mode"
        :class="{ 'setup__mode--selected': state.mode === id }"
        @click="state.mode = id"
      >
        <span class="setup__mode-title">{{ GAME_MODE_DISPLAY[id].title }}</span>
        <span class="setup__mode-tag">{{ GAME_MODE_DISPLAY[id].tagline }}</span>
        <span class="setup__mode-blurb">{{ GAME_MODE_DISPLAY[id].blurb }}</span>
      </button>
    </div>

    <template v-if="state.mode === 'checkout121'">
      <Eyebrow style="margin: 24px 0 10px">Max darts per round</Eyebrow>
      <SegmentGroup v-model="state.maxDarts" :options="[6, 9, 12, 15, 21]" />

      <Eyebrow style="margin: 24px 0 10px">Rounds</Eyebrow>
      <SegmentGroup v-model="state.rounds" :options="[10, 25, 'endless']" />
    </template>

    <template v-else-if="state.mode === 'standardCheckout'">
      <Eyebrow style="margin: 24px 0 10px">Starting score</Eyebrow>
      <SegmentGroup
        v-model="state.scorePreset"
        :options="[501, 301, 201, 'custom']"
        :labels="['501', '301', '201', 'Custom']"
      />
      <input
        v-if="state.scorePreset === 'custom'"
        class="setup__custom"
        :class="{ 'setup__custom--valid': customScoreValid }"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :value="state.customScore"
        placeholder="e.g. 701"
        @input="onCustomScoreInput"
      />

      <Eyebrow style="margin: 24px 0 10px">Legs to win</Eyebrow>
      <SegmentGroup
        v-model="state.legsPreset"
        :options="[1, 3, 5, 'custom']"
        :labels="['1', '3', '5', 'Custom']"
      />
      <input
        v-if="state.legsPreset === 'custom'"
        class="setup__custom"
        :class="{ 'setup__custom--valid': customLegsValid }"
        type="text"
        inputmode="numeric"
        pattern="[0-9]*"
        :value="state.customLegs"
        placeholder="e.g. 7"
        @input="onCustomLegsInput"
      />
    </template>

    <template v-else>
      <div class="setup__barneys">
        <Eyebrow style="margin-bottom: 10px">How it works</Eyebrow>
        <BodyText style="font-size: 14px">
          Work through 20, 19, 18, 17, 16, 15, bull. Three darts per target. Singles / doubles /
          trebles score 1 / 2 / 3. On the bull: outer = 2 pts, bullseye = 3 pts. Maximum 63.
        </BodyText>
      </div>
    </template>

    <p class="setup__note">{{ display.blurb }}</p>

    <div class="setup__footer">
      <PrimaryButton :disabled="!canStart" @click="startGame">▸ Start</PrimaryButton>
    </div>
  </section>
</template>

<style scoped>
.setup {
  padding: 60px var(--ds-edge-padding) 40px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.setup__back {
  margin-bottom: 20px;
}

.setup__modes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setup__mode {
  width: 100%;
  text-align: left;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 14px 16px;
  cursor: pointer;
  color: var(--ds-text);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.15s;
}

.setup__mode--selected {
  border-color: var(--ds-accent);
  background: rgba(229, 50, 40, 0.08);
  box-shadow: 0 0 22px var(--ds-accent-glow);
}

.setup__mode-title {
  font-family: var(--ds-font-display);
  font-size: 16px;
  font-weight: 700;
}

.setup__mode-tag {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
}

.setup__mode-blurb {
  font-family: var(--ds-font-display);
  font-size: 13px;
  color: var(--ds-muted);
  line-height: 1.4;
}

.setup__barneys {
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 14px 16px;
  margin-top: 24px;
}

.setup__custom {
  margin-top: 10px;
  width: 100%;
  box-sizing: border-box;
  height: var(--ds-input-h);
  padding: 0 16px;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  color: var(--ds-text);
  font-family: var(--ds-font-mono);
  font-size: 18px;
  font-weight: 700;
  outline: none;
  text-align: center;
  caret-color: var(--ds-accent);
  letter-spacing: -0.5px;
  transition: border 0.15s;
}

.setup__custom--valid {
  border-color: var(--ds-accent-dim);
}

.setup__custom:focus-visible {
  border-color: var(--ds-accent);
}

.setup__note {
  margin: 24px 0 0;
  font-family: var(--ds-font-mono);
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--ds-dim);
}

.setup__footer {
  margin-top: auto;
  padding-top: 24px;
}
</style>
