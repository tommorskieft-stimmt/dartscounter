<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

// Tiny bottom-right toast that appears when a new service worker has
// finished installing. Clicking "Refresh" swaps to the new version and
// reloads. Dismiss to stay on the current build until next reload.
const needRefresh = ref(false)
const offlineReady = ref(false)

const { updateServiceWorker } = useRegisterSW({
  onNeedRefresh() {
    needRefresh.value = true
  },
  onOfflineReady() {
    offlineReady.value = true
    window.setTimeout(() => {
      offlineReady.value = false
    }, 3200)
  },
})

async function refresh() {
  await updateServiceWorker(true)
}

function dismissRefresh() {
  needRefresh.value = false
}

onMounted(() => {
  // nothing — the composable registers on import
})
</script>

<template>
  <Teleport to="body">
    <div v-if="needRefresh || offlineReady" class="pwa-toast">
      <div v-if="needRefresh" class="pwa-toast__card pwa-toast__card--accent">
        <span class="pwa-toast__label">Update available</span>
        <div class="pwa-toast__row">
          <button type="button" class="pwa-toast__btn pwa-toast__btn--muted" @click="dismissRefresh">
            Later
          </button>
          <button type="button" class="pwa-toast__btn pwa-toast__btn--primary" @click="refresh">
            Refresh
          </button>
        </div>
      </div>
      <div v-else-if="offlineReady" class="pwa-toast__card">
        <span class="pwa-toast__label">Ready for offline play</span>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  display: flex;
  justify-content: center;
  padding: 0 16px;
  z-index: 1000;
  pointer-events: none;
}

.pwa-toast__card {
  pointer-events: auto;
  background: var(--ds-bg-2);
  border: 1px solid var(--ds-border-2);
  border-radius: var(--ds-radius-lg);
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  max-width: 400px;
  width: 100%;
}

.pwa-toast__card--accent {
  border-color: var(--ds-accent-dim);
  box-shadow: 0 10px 30px var(--ds-accent-glow);
}

.pwa-toast__label {
  flex: 1;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--ds-text);
}

.pwa-toast__row {
  display: flex;
  gap: 8px;
}

.pwa-toast__btn {
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  font-family: var(--ds-font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid transparent;
}

.pwa-toast__btn--muted {
  background: transparent;
  border-color: var(--ds-border-2);
  color: var(--ds-muted);
}

.pwa-toast__btn--primary {
  background: var(--ds-accent);
  color: #fff;
  box-shadow: 0 0 14px var(--ds-accent-glow);
}
</style>
