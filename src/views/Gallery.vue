<script setup lang="ts">
import { ref } from 'vue'
import {
  BackButton,
  BodyText,
  BottomSheet,
  BullseyeMark,
  ConfettiBurst,
  DartsBar,
  Eyebrow,
  FlipNumber,
  Heading,
  LevelCard,
  PrimaryButton,
  RouteDart,
  SecondaryButton,
  SegmentGroup,
  StatTile,
  StepIndicator,
  StyledTextField,
} from '@/design-system'

// Dev-only gallery — proves every DS component renders in isolation.
// Dropped once real screens land (phase 02+).
const name = ref('Phil')
const darts = ref<number | string>(3)
const flip = ref(121)
const confetti = ref(false)
const sheetOpen = ref(false)
const helperOpen = ref(false)
const level = ref<string>('Intermediate')

function fireConfetti() {
  confetti.value = true
  window.setTimeout(() => (confetti.value = false), 900)
}

function bumpFlip() {
  flip.value = Math.max(0, flip.value - 60)
}
</script>

<template>
  <div class="gallery">
    <header class="gallery__head">
      <Eyebrow>Design system · phase 01</Eyebrow>
      <Heading :size="30" style="margin-top: 8px">Component gallery</Heading>
      <BodyText style="margin-top: 6px"> Visual reference while real screens are built. </BodyText>
    </header>

    <section class="gallery__section">
      <Eyebrow>Text</Eyebrow>
      <Heading :size="28">Heading size 28</Heading>
      <Heading :size="44" style="margin-top: 8px">
        Heading <span style="color: var(--ds-accent)">size 44</span>
      </Heading>
      <BodyText style="margin-top: 8px">
        Body text with <em>emphasis</em> in Archivo at 15 / 1.45. Used for paragraph copy.
      </BodyText>
    </section>

    <section class="gallery__section">
      <Eyebrow>Buttons</Eyebrow>
      <div class="gallery__stack">
        <PrimaryButton>▸ Play</PrimaryButton>
        <PrimaryButton :glow="false">Save changes</PrimaryButton>
        <PrimaryButton disabled>Disabled</PrimaryButton>
        <SecondaryButton>Profile</SecondaryButton>
        <BackButton label="Home" />
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Inputs</Eyebrow>
      <div class="gallery__stack">
        <StyledTextField v-model="name" label="First name" placeholder="Phil" :maxlength="30" />
        <SegmentGroup v-model="darts" :options="[1, 2, 3]" />
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Progress</Eyebrow>
      <StepIndicator :step="2" :total="3" />
      <DartsBar :used="5" :max="9" />
    </section>

    <section class="gallery__section">
      <Eyebrow>Level cards</Eyebrow>
      <div class="gallery__stack gallery__stack--tight">
        <LevelCard
          title="Beginner"
          description="Just starting out. Still learning the board."
          :selected="level === 'Beginner'"
          @click="level = 'Beginner'"
        />
        <LevelCard
          title="Intermediate"
          description="Comfortable with scoring. Working on doubles."
          :selected="level === 'Intermediate'"
          @click="level = 'Intermediate'"
        />
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Stats</Eyebrow>
      <div class="gallery__grid">
        <StatTile label="Matches played" :value="12" />
        <StatTile label="Checkout rate" :value="`67%`" />
        <StatTile label="Highest out" :value="134" />
        <StatTile label="Best streak" :value="4" />
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Checkout route</Eyebrow>
      <div class="gallery__route">
        <RouteDart label="T20" />
        <span class="gallery__sep">›</span>
        <RouteDart label="T19" />
        <span class="gallery__sep">›</span>
        <RouteDart label="D12" />
      </div>
    </section>

    <section class="gallery__section gallery__scoreboard">
      <Eyebrow>Scoreboard</Eyebrow>
      <ConfettiBurst :active="confetti" />
      <div class="gallery__score">
        <FlipNumber :value="flip" :color="flip === 0 ? 'var(--ds-green)' : 'var(--ds-text)'" />
      </div>
      <div class="gallery__stack">
        <SecondaryButton @click="bumpFlip">Subtract 60</SecondaryButton>
        <PrimaryButton :glow="true" @click="fireConfetti">Trigger confetti</PrimaryButton>
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Bullseye mark</Eyebrow>
      <div class="gallery__marks">
        <BullseyeMark :size="52" />
        <BullseyeMark :size="120" />
        <BullseyeMark :size="200" />
      </div>
    </section>

    <section class="gallery__section">
      <Eyebrow>Bottom sheets</Eyebrow>
      <div class="gallery__stack">
        <SecondaryButton @click="sheetOpen = true">Open neutral sheet</SecondaryButton>
        <SecondaryButton @click="helperOpen = true">Open checkout helper</SecondaryButton>
      </div>
    </section>

    <BottomSheet :open="sheetOpen" accent="red" @close="sheetOpen = false">
      <Eyebrow style="margin-bottom: 14px">Select level</Eyebrow>
      <div class="gallery__stack gallery__stack--tight">
        <LevelCard
          title="Advanced"
          description="Reliable on common finishes. Hunting consistency."
          selected
        />
        <LevelCard
          title="Expert"
          description="Regularly out in 15 darts or fewer."
          @click="sheetOpen = false"
        />
      </div>
    </BottomSheet>

    <BottomSheet :open="helperOpen" accent="green" @close="helperOpen = false">
      <Eyebrow style="color: var(--ds-green); margin-bottom: 8px">Checkout helper</Eyebrow>
      <BodyText style="margin-bottom: 14px">
        Enter your remaining score and we'll show the suggested route.
      </BodyText>
      <div class="gallery__route">
        <RouteDart label="T20" />
        <RouteDart label="BULL" />
      </div>
    </BottomSheet>
  </div>
</template>

<style scoped>
.gallery {
  padding: 56px var(--ds-edge-padding) 80px;
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.gallery__head {
  display: flex;
  flex-direction: column;
}

.gallery__section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery__stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gallery__stack--tight {
  gap: 8px;
}

.gallery__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.gallery__route {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gallery__sep {
  color: var(--ds-dim);
  font-family: var(--ds-font-mono);
  font-size: 14px;
}

.gallery__scoreboard {
  position: relative;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-xl);
  padding: 20px;
}

.gallery__score {
  display: flex;
  justify-content: center;
  padding: 12px 0 4px;
}

.gallery__marks {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 16px;
}
</style>
