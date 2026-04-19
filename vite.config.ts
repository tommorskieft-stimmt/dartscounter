import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages base path — the repo is tommorskieft-stimmt/dartscounter,
// so the site is served from https://<user>.github.io/dartscounter/.
const BASE_PATH = '/dartscounter/'

export default defineConfig({
  base: BASE_PATH,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      // Ship our own manifest.webmanifest from public/; the plugin just
      // handles the service-worker side.
      registerType: 'prompt',
      strategies: 'generateSW',
      injectRegister: false,
      manifest: false,
      manifestFilename: 'manifest.webmanifest',
      workbox: {
        // Precache everything static so the app runs in airplane mode
        // after a single successful load.
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff,woff2,ttf,mp3}'],
        navigateFallback: `${BASE_PATH}index.html`,
        navigateFallbackDenylist: [/^\/api\//],
        // The match data lives in IndexedDB, not the SW cache, so we
        // don't need any runtime strategies — every request is either
        // a precached app-shell asset or a dev-time call.
        runtimeCaching: [],
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    host: '127.0.0.1',
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
