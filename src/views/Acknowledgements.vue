<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BackButton, BodyText, Eyebrow, Heading } from '@/design-system'

const router = useRouter()
</script>

<template>
  <section class="ack">
    <div class="ack__back">
      <BackButton label="Profile" @click="router.back()" />
    </div>
    <Heading :size="32" style="margin-bottom: 20px">Acknowledgements</Heading>

    <div class="ack__block">
      <Eyebrow style="margin-bottom: 10px">Typefaces</Eyebrow>
      <BodyText style="margin-bottom: 10px">
        Bundled fonts are licensed under the SIL Open Font License 1.1. Full licence text ships
        alongside the fonts in <code>public/fonts/</code>.
      </BodyText>

      <ul class="ack__list">
        <li>
          <strong>Archivo</strong> — © The Archivo Project Authors
          <span class="ack__meta">github.com/Omnibus-Type/Archivo</span>
        </li>
        <li>
          <strong>JetBrains Mono</strong> — © JetBrains s.r.o.
          <span class="ack__meta">github.com/JetBrains/JetBrainsMono</span>
        </li>
      </ul>
    </div>

    <div class="ack__block">
      <Eyebrow style="margin-bottom: 10px">Origin</Eyebrow>
      <BodyText>
        Port of the One·Two·One iOS app. All checkout routes come from the classic 170→2
        chart used throughout the prototype and the native app.
      </BodyText>
    </div>

    <div class="ack__block">
      <Eyebrow style="margin-bottom: 10px">Privacy</Eyebrow>
      <BodyText>
        No analytics, no tracking, no cookies, no network calls after first load. Your matches
        and profile live only in this browser's IndexedDB storage.
      </BodyText>
    </div>
  </section>
</template>

<style scoped>
.ack {
  padding: 60px var(--ds-edge-padding) 40px;
  max-width: 480px;
  margin: 0 auto;
}

.ack__back {
  margin-bottom: 20px;
}

.ack__block {
  margin-bottom: 28px;
}

.ack__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ack__list li {
  font-family: var(--ds-font-display);
  color: var(--ds-text);
  font-size: 14px;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
}

.ack__meta {
  font-family: var(--ds-font-mono);
  font-size: 11px;
  color: var(--ds-dim);
  letter-spacing: 0.3px;
}

code {
  font-family: var(--ds-font-mono);
  font-size: 13px;
  background: var(--ds-bg-2);
  padding: 1px 6px;
  border-radius: 4px;
  color: var(--ds-text);
}
</style>
