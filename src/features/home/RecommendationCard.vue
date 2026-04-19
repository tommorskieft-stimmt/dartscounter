<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { BodyText, Eyebrow } from '@/design-system'
import { currentRecommendation, type Recommendation } from '@/services/recommendation'

const router = useRouter()
const rec = ref<Recommendation | null>(null)

onMounted(async () => {
  rec.value = await currentRecommendation()
})

function go() {
  if (!rec.value) return
  router.push({ name: 'play-setup' })
}
</script>

<template>
  <button v-if="rec" type="button" class="rec" @click="go">
    <Eyebrow style="color: var(--ds-green); margin-bottom: 4px">Next drill</Eyebrow>
    <span class="rec__title">{{ rec.title }}</span>
    <BodyText style="font-size: 13px; margin-top: 4px">{{ rec.reason }}</BodyText>
    <span class="rec__arrow" aria-hidden="true">→</span>
  </button>
</template>

<style scoped>
.rec {
  position: relative;
  width: 100%;
  text-align: left;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-green-dim);
  border-radius: var(--ds-radius-lg);
  padding: 14px 44px 14px 16px;
  color: var(--ds-text);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: transform 0.1s;
  box-shadow: 0 0 18px var(--ds-green-glow);
}

.rec:active {
  transform: scale(0.99);
}

.rec__title {
  font-family: var(--ds-font-display);
  font-size: 16px;
  font-weight: 700;
  color: var(--ds-text);
  letter-spacing: -0.3px;
}

.rec__arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ds-green);
  font-family: var(--ds-font-mono);
  font-weight: 700;
  font-size: 16px;
}
</style>
