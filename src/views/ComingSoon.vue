<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BackButton, BodyText, Eyebrow, Heading } from '@/design-system'

interface Props {
  phase: string
  feature: string
}

defineProps<Props>()

const router = useRouter()
</script>

<template>
  <section class="coming">
    <div class="coming__back">
      <BackButton label="Home" @click="router.push({ name: 'home' })" />
    </div>
    <div class="coming__body">
      <Eyebrow>{{ phase }}</Eyebrow>
      <Heading :size="32" style="margin-top: 10px">{{ feature }}</Heading>
      <BodyText style="margin-top: 14px">
        Placeholder. This screen lands in a later phase — the scaffolding is wired up so the
        route resolves without a 404.
      </BodyText>
    </div>
  </section>
</template>

<style scoped>
.coming {
  padding: 60px var(--ds-edge-padding) 40px;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.coming__back {
  margin-bottom: 20px;
}

.coming__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
