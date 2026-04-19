# One·Two·One — Darts Practice (Web)

A browser-native port of the One·Two·One iOS app. Installable as a PWA,
works fully offline, zero third-party tracking. Three practice modes:

- **121 Checkout** — target climbs on checkout, drops on miss, floor 121.
- **Standard Checkout** — classic 501 / 301 / 201 / 101, double-out, multi-leg.
- **Barney's Accuracy Drill** — 20 → 19 → 18 → 17 → 16 → 15 → bull, three
  darts per target, singles / doubles / trebles score 1 / 2 / 3.

The iOS original lives at `../dartscounter-2` (native Swift + SwiftData).
This repository is the web port.

---

## Stack

- **Vite 8** + **Vue 3** + **TypeScript (strict)**
- **Vue Router 4** (history mode, base `/dartscounter/`)
- **Pinia** for reactive game state
- **Dexie 4** (IndexedDB) for local persistence
- **Tailwind CSS v4** with CSS custom-property design tokens
- **vite-plugin-pwa** (Workbox) for installable PWA
- **Vitest** + **Playwright** for tests
- Self-hosted **Archivo** + **JetBrains Mono** (OFL)

No backend. No analytics. No tracking. Your device, your stats.

---

## Develop

```bash
pnpm install
pnpm dev       # http://127.0.0.1:5173/dartscounter/
```

## Verify

```bash
pnpm typecheck
pnpm lint
pnpm test               # Vitest (unit)
pnpm build
pnpm preview
pnpm test:e2e:install   # one-time Playwright browser install
pnpm test:e2e
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages at
`https://tommorskieft-stimmt.github.io/dartscounter/`.

One-time setup in the GitHub UI: **Settings → Pages → Source = "GitHub
Actions"**.

---

## Structure

```
src/
├── main.ts                     # App entry
├── App.vue                     # Root shell
├── router/                     # Vue Router
├── styles/                     # tokens.css, fonts.css, globals.css
├── design-system/              # Ported DS components (phase 01)
├── game/                       # Pure-TS game engines (phase 04)
├── stores/                     # Pinia stores (phase 04/05)
├── db/                         # Dexie schema + repositories (phase 03)
├── services/                   # Haptics, sound, recommendation (phase 05/09)
├── views/                      # Route-level pages (phases 02/05/06/07)
└── features/                   # Feature-scoped composables
public/
├── favicon.svg
├── manifest.webmanifest        # (phase 08)
├── icons/                      # PWA icons (phase 08)
├── splash/                     # Apple splash screens (phase 08)
├── fonts/                      # Self-hosted OFL TTFs (phase 01)
└── sounds/                     # Game feedback sounds (phase 09)
tests/
├── unit/                       # Vitest
└── e2e/                        # Playwright
```

## Design reference

`design/reference/` holds the Claude Design handoff bundle (HTML + JSX
prototype). It is read-only design reference — do not import its code.
Colours, typography, and component behaviour are extracted into
`src/styles/tokens.css` and reimplemented in Vue.

## Licensing

App source: proprietary to Stimmt.

Bundled fonts (phase 01) are licensed under the SIL Open Font License 1.1:

- **Archivo** — © The Archivo Project Authors
- **JetBrains Mono** — © JetBrains s.r.o.
