import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages base path — the repo is tommorskieft-stimmt/dartscounter,
// so the site is served from https://<user>.github.io/dartscounter/.
const BASE_PATH = '/dartscounter/'

// The PWA plugin (vite-plugin-pwa) is wired up in phase 08, where the full
// manifest, service-worker, icons, and Apple splash screens land. Keeping
// it out of phase 00 avoids a rolldown-compat warning from the current
// release and keeps the scaffold build clean.
export default defineConfig({
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
