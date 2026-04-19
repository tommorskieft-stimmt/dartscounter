# One·Two·One — Darts Practice (Web)

Browser-native port of the One·Two·One iOS app. Installable PWA, fully
offline, zero third-party tracking. Three practice modes:

- **121 Checkout** — target climbs on checkout, drops on miss, floored at 121.
- **Standard Checkout** — classic 501 / 301 / 201 / 101, double-out, multi-leg.
- **Barney's Accuracy Drill** — 20 → 19 → 18 → 17 → 16 → 15 → bull, three
  darts per target, singles / doubles / trebles score 1 / 2 / 3.

The iOS original lives at `../dartscounter-2` (native Swift + SwiftData).
This repository is the web port.

---

## Stack

- **Vite 8** + **Vue 3** + **TypeScript (strict)**
- **Vue Router 4** (history mode, base `/dartscounter/`)
- **Pinia** — transient game sessions
- **Dexie 4** (IndexedDB) — local-only persistence (profile, matches,
  rounds, turns)
- **Tailwind CSS v4** + CSS custom-property design tokens
- **vite-plugin-pwa** (Workbox) — precaches the full app shell; works
  offline after first load
- **sharp** (via `pnpm icons`) — regenerates every PWA icon + Apple
  splash screen from `design/icon-master.svg`
- **Vitest** + **Playwright** — unit + smoke
- **ESLint 9** (flat config) + **Prettier**

No backend. No analytics. No tracking. Your device, your stats.

---

## Develop

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173/dartscounter/
```

Dev helpers available in the browser console (dev mode only):

```js
await window.__seedDemo()      // ~30 demo matches across all three modes
await window.__clearMatches()  // wipe match history
```

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test                  # Vitest — 60 assertions covering engines + stores
pnpm build
pnpm preview
pnpm test:e2e:install      # one-time: download Playwright browsers
pnpm test:e2e              # smoke suite
```

## Regenerate icons / splash screens

```bash
pnpm icons  # emits everything under public/icons/ and public/splash/
```

## Deploy

`main` → `.github/workflows/deploy.yml` → GitHub Pages at
`https://tommorskieft-stimmt.github.io/dartscounter/`.

One-time setup: **Settings → Pages → Source = "GitHub Actions"** in the
GitHub repo UI.

---

## Structure

```
src/
├── main.ts                     # App entry (registers dev-only seeder helpers)
├── App.vue                     # Root shell + PWA update toast
├── router/                     # Vue Router with profile-gated guard
├── styles/                     # tokens.css, fonts.css, globals.css
├── design-system/              # Every DS component (phases 01, 06, 07)
├── game/                       # Pure-TS engines (DartNotation, CheckoutChart,
│                               #   CheckoutEngine, GameMode, types)
├── stores/                     # Pinia: profile, playConfig, 3 session stores
├── db/                         # Dexie schema + repositories + dev seeder
├── services/                   # Haptics + recommendation
├── features/
│   ├── home/                   # RecommendationCard
│   ├── play/                   # Gameplay composites + persistence
│   └── stats/                  # Aggregator (performance analytics)
├── views/                      # Route-level pages
│   └── mode/                   # Mode-specific Live + Over dispatch targets
├── types/                      # domain.ts — the source of truth for shapes
├── constants/                  # LEVEL_COPY
└── components/                 # PwaUpdatePrompt

public/
├── favicon.svg
├── manifest.webmanifest        # PWA manifest
├── icons/                      # All PWA icons (generated — `pnpm icons`)
├── splash/                     # Apple splash screens per device
└── fonts/                      # Reserved — self-hosted OFL TTFs come here

tests/
├── unit/                       # Vitest — game engines + session stores
└── e2e/                        # Playwright — smoke (first visit → onboarding → home)
```

## Design reference

`design/reference/` contains the Claude Design handoff bundle (HTML +
JSX prototype). Read-only — do not import its code. Colours,
typography, and component behaviour are extracted into
`src/styles/tokens.css` and reimplemented in Vue.

`design/icon-master.svg` is the source artwork for every PWA icon.

## Licensing

App source: proprietary to Stimmt.

Bundled fonts (once added to `public/fonts/`) are licensed under the SIL
Open Font License 1.1:

- **Archivo** — © The Archivo Project Authors
- **JetBrains Mono** — © JetBrains s.r.o.

## Build notes

- Service worker precaches every asset under `**/*.{js,css,html,svg,png,webmanifest,woff,woff2,ttf,mp3}`.
  A full-page navigation falls back to `index.html` so client-side
  routing works offline.
- IndexedDB schema is additive — each `version()` block in
  `src/db/database.ts` preserves earlier blocks untouched.
- Tom's personal `CLAUDE.md` global rule ("never commit") is overridden
  for this repo only via the project-scoped `CLAUDE.md`.
