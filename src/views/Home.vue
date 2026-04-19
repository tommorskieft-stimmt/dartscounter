<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  BodyText,
  BullseyeMark,
  Eyebrow,
  Heading,
  PrimaryButton,
  SecondaryButton,
} from '@/design-system'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()

const greetingName = computed(() => profileStore.profile?.firstName ?? 'Player')
</script>

<template>
  <section class="home">
    <div class="home__glow" />

    <div class="home__content">
      <Eyebrow>
        One<span style="color: var(--ds-accent)">·</span>Two<span style="color: var(--ds-green)"
          >·</span
        >One
      </Eyebrow>
      <div style="height: 10px" />
      <Heading :size="44" style="letter-spacing: -1.5px">
        Hi, <span style="color: var(--ds-accent)">{{ greetingName }}</span
        >.
      </Heading>
      <BodyText style="margin-top: 8px; font-size: 17px">Ready to practice?</BodyText>

      <div class="home__bullseye">
        <BullseyeMark :size="200" />
      </div>

      <div class="home__actions">
        <PrimaryButton @click="router.push({ name: 'play-setup' })">▸ Play</PrimaryButton>
        <SecondaryButton @click="router.push({ name: 'profile' })">Profile</SecondaryButton>
      </div>

      <p class="home__teaser">Stats roll in once you've played a match.</p>
    </div>
  </section>
</template>

<style scoped>
.home {
  position: relative;
  overflow: hidden;
  padding: 72px var(--ds-edge-padding) 40px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.home__glow {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 460px;
  height: 460px;
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    var(--ds-accent-glow) 0%,
    var(--ds-green-glow) 40%,
    transparent 70%
  );
  filter: blur(30px);
  opacity: 0.55;
}

.home__content {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.home__bullseye {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home__actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home__teaser {
  text-align: center;
  margin-top: 20px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-muted);
}
</style>
