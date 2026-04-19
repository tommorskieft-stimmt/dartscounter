<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BodyText,
  Eyebrow,
  Heading,
  LevelCard,
  PrimaryButton,
  ScreenShell,
  SecondaryButton,
  StepIndicator,
  StyledTextField,
} from '@/design-system'
import { useProfileStore } from '@/stores/profile'
import { LEVEL_COPY } from '@/constants/levels'
import type { PlayerLevel } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()

interface Draft {
  firstName: string
  lastName: string
  birthday: string
  level: PlayerLevel | null
}

const draft = reactive<Draft>({
  firstName: '',
  lastName: '',
  birthday: '',
  level: null,
})

const step = ref<1 | 2 | 3>(1)

const birthdayMax = new Date().toISOString().slice(0, 10)
const birthdayMin = new Date(Date.now() - 120 * 365.25 * 24 * 3600 * 1000)
  .toISOString()
  .slice(0, 10)

const step1Valid = computed(() => draft.firstName.trim() !== '' && draft.lastName.trim() !== '')

const step2Valid = computed(() => {
  if (!draft.birthday) return false
  const d = new Date(draft.birthday)
  if (Number.isNaN(d.getTime())) return false
  return d.toISOString().slice(0, 10) >= birthdayMin && d.toISOString().slice(0, 10) <= birthdayMax
})

const step3Valid = computed(() => draft.level !== null)

async function finish() {
  if (!step3Valid.value || !draft.level) return
  await profileStore.save({
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    birthday: draft.birthday || undefined,
    level: draft.level,
    soundsEnabled: true,
  })
  await router.replace({ name: 'home' })
}
</script>

<template>
  <ScreenShell>
    <StepIndicator :step="step" :total="3" />

    <template v-if="step === 1">
      <Eyebrow style="margin-bottom: 14px">Step 1 of 3</Eyebrow>
      <Heading :size="36">What's your name?</Heading>
      <BodyText style="margin-top: 10px; margin-bottom: 32px">
        We'll use your first name to greet you.
      </BodyText>
      <div class="onboarding__stack">
        <StyledTextField
          v-model="draft.firstName"
          label="First name"
          placeholder="Phil"
          :maxlength="30"
          autofocus
        />
        <StyledTextField
          v-model="draft.lastName"
          label="Last name"
          placeholder="Taylor"
          :maxlength="30"
        />
      </div>
    </template>

    <template v-else-if="step === 2">
      <Eyebrow style="margin-bottom: 14px">Step 2 of 3</Eyebrow>
      <Heading :size="36">When's your birthday?</Heading>
      <BodyText style="margin-top: 10px; margin-bottom: 32px">
        Optional flex stat on the profile.
      </BodyText>
      <div>
        <label class="onboarding__label">Birthday</label>
        <input
          v-model="draft.birthday"
          class="onboarding__date"
          type="date"
          :min="birthdayMin"
          :max="birthdayMax"
        />
      </div>
    </template>

    <template v-else>
      <Eyebrow style="margin-bottom: 14px">Step 3 of 3</Eyebrow>
      <Heading :size="36">What's your level?</Heading>
      <BodyText style="margin-top: 10px; margin-bottom: 24px">
        Pick the one that best describes you. You can change it any time.
      </BodyText>
      <div class="onboarding__stack onboarding__stack--tight">
        <LevelCard
          v-for="l in LEVEL_COPY"
          :key="l.id"
          :title="l.title"
          :description="l.description"
          :selected="draft.level === l.id"
          @click="draft.level = l.id"
        />
      </div>
    </template>

    <template #footer>
      <div v-if="step === 1">
        <PrimaryButton :disabled="!step1Valid" @click="step = 2">Next</PrimaryButton>
      </div>
      <div v-else-if="step === 2" class="onboarding__nav">
        <SecondaryButton class="onboarding__back" @click="step = 1">◂ Back</SecondaryButton>
        <PrimaryButton :disabled="!step2Valid" @click="step = 3">Next</PrimaryButton>
      </div>
      <div v-else class="onboarding__nav">
        <SecondaryButton class="onboarding__back" @click="step = 2">◂ Back</SecondaryButton>
        <PrimaryButton :disabled="!step3Valid" @click="finish">Finish</PrimaryButton>
      </div>
    </template>
  </ScreenShell>
</template>

<style scoped>
.onboarding__stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.onboarding__stack--tight {
  gap: 10px;
}

.onboarding__nav {
  display: flex;
  gap: 12px;
}

.onboarding__back {
  flex: 0 0 96px;
}

.onboarding__label {
  display: block;
  font-family: var(--ds-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 8px;
}

.onboarding__date {
  width: 100%;
  height: var(--ds-input-lg-h);
  box-sizing: border-box;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 0 16px;
  color: var(--ds-text);
  font-family: var(--ds-font-mono);
  font-size: 18px;
  font-weight: 500;
  outline: none;
  transition: border 0.15s;
  color-scheme: dark;
}

.onboarding__date:focus-visible {
  border-color: var(--ds-accent);
}
</style>
