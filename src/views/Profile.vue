<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import {
  BackButton,
  BodyText,
  BottomSheet,
  Eyebrow,
  Heading,
  LevelCard,
  PrimaryButton,
  SecondaryButton,
} from '@/design-system'
import { useProfileStore } from '@/stores/profile'
import { LEVEL_COPY, levelTitle } from '@/constants/levels'
import type { PlayerLevel } from '@/types/domain'

const router = useRouter()
const profileStore = useProfileStore()

interface Draft {
  firstName: string
  lastName: string
  birthday: string
  level: PlayerLevel
  soundsEnabled: boolean
}

const draft = reactive<Draft>({
  firstName: '',
  lastName: '',
  birthday: '',
  level: 'beginner',
  soundsEnabled: true,
})

watchEffect(() => {
  const p = profileStore.profile
  if (!p) return
  draft.firstName = p.firstName
  draft.lastName = p.lastName
  draft.birthday = p.birthday ?? ''
  draft.level = p.level
  draft.soundsEnabled = p.soundsEnabled
})

const dirty = computed(() => {
  const p = profileStore.profile
  if (!p) return false
  return (
    draft.firstName !== p.firstName ||
    draft.lastName !== p.lastName ||
    draft.birthday !== (p.birthday ?? '') ||
    draft.level !== p.level ||
    draft.soundsEnabled !== p.soundsEnabled
  )
})

const levelSheetOpen = ref(false)
const confirmDiscard = ref(false)
const savedToast = ref(false)

const birthdayDisplay = computed(() => {
  if (!draft.birthday) return '—'
  const d = new Date(draft.birthday)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
})

async function saveChanges() {
  await profileStore.save({
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    birthday: draft.birthday || undefined,
    level: draft.level,
    soundsEnabled: draft.soundsEnabled,
  })
  savedToast.value = true
  window.setTimeout(() => (savedToast.value = false), 1800)
}

function discardEdits() {
  const p = profileStore.profile
  if (!p) return
  draft.firstName = p.firstName
  draft.lastName = p.lastName
  draft.birthday = p.birthday ?? ''
  draft.level = p.level
  draft.soundsEnabled = p.soundsEnabled
}

function handleBack() {
  if (dirty.value) {
    confirmDiscard.value = true
    return
  }
  router.push({ name: 'home' })
}

function handlePlay() {
  router.push({ name: 'play-setup' })
}

function selectLevel(l: PlayerLevel) {
  draft.level = l
  levelSheetOpen.value = false
}
</script>

<template>
  <section class="profile">
    <div class="profile__back">
      <BackButton label="Home" @click="handleBack" />
    </div>

    <Heading :size="36" style="margin-bottom: 28px">Profile</Heading>

    <Eyebrow style="margin-bottom: 12px">Details</Eyebrow>
    <div class="profile__details">
      <div class="profile__field">
        <label class="profile__label">First name</label>
        <input v-model="draft.firstName" class="profile__input" type="text" maxlength="30" />
      </div>

      <div class="profile__field">
        <label class="profile__label">Last name</label>
        <input v-model="draft.lastName" class="profile__input" type="text" maxlength="30" />
      </div>

      <div class="profile__field">
        <label class="profile__label">Birthday</label>
        <input v-model="draft.birthday" class="profile__input profile__input--mono" type="date" />
      </div>

      <div class="profile__field">
        <label class="profile__label">Level</label>
        <button class="profile__level" type="button" @click="levelSheetOpen = true">
          <span>{{ levelTitle(draft.level) }}</span>
          <span class="profile__chevron">▸</span>
        </button>
      </div>
    </div>

    <div class="profile__actions">
      <PrimaryButton
        :disabled="!dirty"
        :glow="dirty"
        style="flex: 1"
        @click="saveChanges"
      >
        Save Changes
      </PrimaryButton>
      <button v-if="dirty" type="button" class="profile__discard" @click="discardEdits">
        Discard
      </button>
    </div>
    <div v-if="savedToast" class="profile__toast">✓ Profile updated · {{ birthdayDisplay }}</div>

    <div class="profile__section">
      <Eyebrow style="margin-bottom: 14px">Settings</Eyebrow>
      <label class="profile__switch">
        <span class="profile__switch-label">Sounds</span>
        <input v-model="draft.soundsEnabled" type="checkbox" class="profile__switch-input" />
        <span class="profile__switch-track" aria-hidden="true">
          <span class="profile__switch-thumb" />
        </span>
      </label>
    </div>

    <div class="profile__section">
      <Eyebrow style="margin-bottom: 14px">Overall stats</Eyebrow>
      <div class="profile__empty">
        No matches played yet — hit
        <button type="button" class="profile__empty-cta" @click="handlePlay">PLAY</button>
        to start.
      </div>
    </div>

    <div class="profile__section">
      <router-link :to="{ name: 'acknowledgements' }" class="profile__link">
        Acknowledgements
      </router-link>
    </div>

    <BottomSheet :open="levelSheetOpen" accent="red" @close="levelSheetOpen = false">
      <Eyebrow style="margin-bottom: 14px">Select level</Eyebrow>
      <div class="profile__level-list">
        <LevelCard
          v-for="l in LEVEL_COPY"
          :key="l.id"
          :title="l.title"
          :description="l.description"
          :selected="draft.level === l.id"
          @click="selectLevel(l.id)"
        />
      </div>
    </BottomSheet>

    <div v-if="confirmDiscard" class="profile__confirm" @click.self="confirmDiscard = false">
      <div class="profile__confirm-card">
        <Heading :size="22" style="margin-bottom: 8px">Discard changes?</Heading>
        <BodyText style="margin-bottom: 18px; font-size: 14px">
          Your edits will be lost.
        </BodyText>
        <div class="profile__confirm-row">
          <SecondaryButton style="flex: 1; height: 48px" @click="confirmDiscard = false">
            Keep Editing
          </SecondaryButton>
          <PrimaryButton
            style="flex: 1; height: 48px"
            :glow="false"
            @click="
              () => {
                discardEdits()
                confirmDiscard = false
                router.push({ name: 'home' })
              }
            "
          >
            Discard
          </PrimaryButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.profile {
  position: relative;
  padding: 60px var(--ds-edge-padding) 60px;
  min-height: 100%;
  max-width: 480px;
  margin: 0 auto;
}

.profile__back {
  margin-bottom: 20px;
}

.profile__details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 8px;
}

.profile__field {
  display: flex;
  flex-direction: column;
}

.profile__label {
  font-family: var(--ds-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--ds-muted);
  margin-bottom: 8px;
}

.profile__input {
  width: 100%;
  height: var(--ds-input-h);
  box-sizing: border-box;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 0 16px;
  color: var(--ds-text);
  font-family: var(--ds-font-display);
  font-size: 17px;
  font-weight: 500;
  outline: none;
  transition: border 0.15s;
  caret-color: var(--ds-accent);
}

.profile__input:focus-visible {
  border-color: var(--ds-accent);
}

.profile__input--mono {
  font-family: var(--ds-font-mono);
  font-size: 16px;
  color-scheme: dark;
}

.profile__level {
  width: 100%;
  height: var(--ds-input-h);
  box-sizing: border-box;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 0 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--ds-font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--ds-text);
}

.profile__chevron {
  color: var(--ds-dim);
  font-size: 14px;
}

.profile__actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 18px;
}

.profile__discard {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ds-muted);
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 600;
  padding: 10px 4px;
}

.profile__toast {
  text-align: center;
  margin-top: 8px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-accent);
}

.profile__section {
  margin-top: 36px;
}

.profile__empty {
  padding: 32px 20px;
  border-radius: var(--ds-radius-md);
  background: var(--ds-bg-2);
  border: 1px dashed var(--ds-border-2);
  text-align: center;
  font-family: var(--ds-font-display);
  font-size: 14px;
  color: var(--ds-muted);
  line-height: 1.45;
}

.profile__empty-cta {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: var(--ds-accent);
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: rgba(229, 50, 40, 0.4);
  text-underline-offset: 3px;
}

.profile__link {
  color: var(--ds-muted);
  font-family: var(--ds-font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  text-decoration: none;
}

.profile__link:hover {
  color: var(--ds-text);
}

.profile__switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  padding: 16px 18px;
  cursor: pointer;
  user-select: none;
}

.profile__switch-label {
  font-family: var(--ds-font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--ds-text);
}

.profile__switch-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.profile__switch-track {
  width: 46px;
  height: 26px;
  border-radius: 13px;
  background: var(--ds-bg-3);
  border: 1px solid var(--ds-border-2);
  position: relative;
  transition: background 0.2s;
}

.profile__switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ds-muted);
  transition:
    transform 0.2s,
    background 0.2s;
}

.profile__switch-input:checked ~ .profile__switch-track {
  background: var(--ds-accent);
  border-color: var(--ds-accent);
}

.profile__switch-input:checked ~ .profile__switch-track .profile__switch-thumb {
  transform: translateX(20px);
  background: #fff;
}

.profile__level-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile__confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.profile__confirm-card {
  width: 100%;
  max-width: 400px;
  background: var(--ds-bg-2);
  border-radius: var(--ds-radius-xl);
  padding: 22px 22px 16px;
  border: 1px solid var(--ds-border-2);
}

.profile__confirm-row {
  display: flex;
  gap: 10px;
}
</style>
