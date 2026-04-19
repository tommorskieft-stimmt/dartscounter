import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router } from './router'

import './styles/globals.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

// Dev-only helpers — available from the browser devtools for quick
// seeding / resetting. Kept out of production builds via import.meta.env.DEV.
if (import.meta.env.DEV) {
  void import('@/db/seeder').then(({ seedDemoMatches }) => {
    ;(window as unknown as { __seedDemo: typeof seedDemoMatches }).__seedDemo = seedDemoMatches
  })
  void import('@/db/repositories/matches').then(({ clearAllMatches }) => {
    ;(window as unknown as { __clearMatches: typeof clearAllMatches }).__clearMatches =
      clearAllMatches
  })
}
