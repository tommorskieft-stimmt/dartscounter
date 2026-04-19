# One·Two·One → Static PWA Conversion Plan (v2)

**Date:** 2026-04-19
**Source (code reference):** `/Users/tommorskieft/Projects/dartscounter-2` (native iOS / SwiftUI / SwiftData)
**Source (design reference):** `/Users/tommorskieft/Downloads/dart-counter/` (Claude Design handoff bundle — HTML/JSX prototype)
**Target:** `/Users/tommorskieft/Projects/dartscounter` (static PWA, Vue 3 + TS)
**Repo:** `git@github.com:tommorskieft-stimmt/dartscounter.git`
**Hosting:** GitHub Pages (deploy via Actions on push to `main`)

> **v1 history:** Initially scoped as a Laravel+Inertia webapp. Dropped after Tom chose GitHub Pages (static-only) + single-user + no leaderboards + no iOS import. A Laravel backend adds no value when the app is fully local.

---

## 1. Goals

- Port One·Two·One to a browser-native app, installable as a PWA, offline-first.
- Preserve all **three game modes** (121 Checkout, Standard Checkout 501/301/201/101, Barney's Accuracy Drill), full checkout chart, undo, per-match history, and career stats.
- **Feel like a native app on phones** — `apple-mobile-web-app-capable`, Android theme colour, maskable icons, custom Apple splash screens, standalone display mode, no browser chrome.
- Preserve the pub/cafe dark aesthetic 1:1 with the iOS app and the Claude Design prototype.
- **Performance analytics only** — the app records and visualises Tom's darts performance (averages, checkout rate, heatmaps, trends). No web analytics, no tracking, no cookies, no third parties.
- Single-user by design — your device, your stats, stored locally in IndexedDB.
- Git branch per phase, PR → squash-merge → delete branch.

---

## 2. Final stack

| Layer       | Choice                                                                                                  | Why                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Build tool  | **Vite 5**                                                                                              | First-class Vue + TS, fast dev, best-in-class PWA plugin                                |
| Framework   | **Vue 3 (Composition API) + TypeScript (strict)**                                                       | Reactive store maps cleanly to SwiftUI `@Observable`; TS keeps game engines safe        |
| Routing     | **Vue Router 4** (history mode, base `/dartscounter/` for Pages)                                        | Standard SPA routing                                                                    |
| State       | **Pinia**                                                                                               | Stores mirror `GameSession` / `StandardCheckoutSession` / `BarneysSession`              |
| Storage     | **Dexie 4** (IndexedDB)                                                                                 | Typed schema, migrations, works offline, millions of rows fine                          |
| Styling     | **Tailwind CSS v4** with CSS custom properties for design tokens                                        | 1:1 port of `DS.*` tokens; atomic utility classes mirror the prototype's inline styles  |
| Charts      | **Lightweight custom SVG components** (no chart lib)                                                    | `TrendLineChart` is 40 lines; no need for Chart.js bloat                                |
| PWA         | **vite-plugin-pwa** (Workbox) + hand-written `manifest.webmanifest` + iOS/Android meta tags             | Installable, offline, auto-update, background-sync not needed (single-user, local-only) |
| Fonts       | **Self-hosted Archivo + JetBrains Mono** (OFL TTFs from the iOS app's `Resources/Fonts/`)               | No Google Fonts round-trip; identical look to iOS; works offline                        |
| Haptics     | **Web Vibration API** (Android) + CSS scale pulse fallback (iOS)                                        | iOS Safari doesn't expose haptics; graceful degradation                                 |
| Sound       | **Bundled MP3** (converted from the iOS AIFF sources) via `<audio>`, toggleable in Profile              | Same sound events: turn submit, checkout, bust, round advance                           |
| Testing     | **Vitest** (game engines + stores) + **Playwright** (smoke)                                             | Cover `CheckoutEngine`, bust detection, double-out rule, Barney's target progression    |
| Lint/format | **ESLint + Prettier** with Vue/TS presets                                                               | Standard                                                                                |
| CI/CD       | **GitHub Actions** — `build-and-deploy.yml` on push to `main` → builds → publishes to `gh-pages` branch | Free, zero config drift                                                                 |

**No third-party analytics. No tracking scripts. No cookies. No network calls after initial load.**

---

## 3. Repository layout

```
dartscounter/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── CLAUDE.md                          # Project-scoped Claude rules (overrides global to allow commit/push/merge)
├── README.md
├── design/
│   └── reference/                     # Copy of Claude Design handoff (HTML/JSX prototype) — DESIGN REFERENCE ONLY
├── docs/
│   └── plans/
│       └── 2026-04-19-laravel-conversion.md   # this file
├── public/
│   ├── manifest.webmanifest
│   ├── icons/                         # All PWA icons (generated from master)
│   ├── splash/                        # Apple splash screens per device size (generated)
│   ├── fonts/                         # Archivo + JetBrains Mono TTFs (OFL)
│   └── sounds/                        # Turn/checkout/bust/round MP3s
├── src/
│   ├── main.ts                        # Vue entry, router mount, Dexie open, SW register
│   ├── App.vue                        # Root layout + route transitions
│   ├── router/
│   │   └── index.ts
│   ├── styles/
│   │   ├── tokens.css                 # CSS custom properties for DS
│   │   ├── fonts.css                  # @font-face declarations
│   │   └── globals.css                # Resets, base, scrollbar kill
│   ├── design-system/                 # Ported DesignSystem/Components/* as Vue
│   │   ├── BullseyeMark.vue
│   │   ├── PrimaryButton.vue
│   │   ├── SecondaryButton.vue
│   │   ├── BackButton.vue
│   │   ├── BottomSheet.vue
│   │   ├── ConfettiBurst.vue
│   │   ├── DartsBar.vue
│   │   ├── FlipNumber.vue
│   │   ├── LevelCard.vue
│   │   ├── RouteDart.vue
│   │   ├── SegmentGroup.vue
│   │   ├── StatTile.vue
│   │   ├── StepIndicator.vue
│   │   ├── StyledTextField.vue
│   │   ├── text/
│   │   │   ├── Eyebrow.vue
│   │   │   ├── Heading.vue
│   │   │   └── BodyText.vue
│   │   └── index.ts
│   ├── game/                          # Pure TS ports of iOS Game/ folder
│   │   ├── DartNotation.ts
│   │   ├── CheckoutChart.ts           # Full 170→2 table
│   │   ├── CheckoutEngine.ts
│   │   ├── GameMode.ts
│   │   └── types.ts
│   ├── stores/                        # Pinia stores
│   │   ├── profile.ts
│   │   ├── sounds.ts
│   │   ├── checkout121.ts             # was GameSession.swift
│   │   ├── standardCheckout.ts        # was StandardCheckoutSession.swift
│   │   ├── barneys.ts                 # was BarneysSession.swift
│   │   └── stats.ts
│   ├── db/                            # Dexie schema + repositories
│   │   ├── database.ts
│   │   ├── migrations.ts
│   │   └── repositories/
│   │       ├── matches.ts
│   │       └── profile.ts
│   ├── services/
│   │   ├── haptics.ts
│   │   ├── sound.ts
│   │   └── recommendation.ts
│   ├── views/                         # Route-level pages
│   │   ├── Onboarding.vue             # 3 steps in-page
│   │   ├── Home.vue
│   │   ├── Profile.vue
│   │   ├── Stats.vue
│   │   ├── PlaySetup.vue
│   │   ├── PlayLive.vue               # Dispatches on mode
│   │   ├── PlayOver.vue               # Dispatches on mode
│   │   └── mode/
│   │       ├── Checkout121Live.vue
│   │       ├── Checkout121Over.vue
│   │       ├── StandardLive.vue
│   │       ├── StandardOver.vue
│   │       ├── BarneysLive.vue
│   │       └── BarneysOver.vue
│   ├── features/                      # Feature-specific composables
│   │   ├── play/
│   │   │   ├── useGameEngine.ts
│   │   │   └── useCheckoutHelper.ts
│   │   └── stats/
│   │       └── useStatsAggregator.ts
│   └── types/
│       └── domain.ts
├── tests/
│   ├── unit/                          # Vitest
│   │   ├── CheckoutEngine.spec.ts
│   │   ├── checkout121.spec.ts
│   │   ├── standardCheckout.spec.ts
│   │   └── barneys.spec.ts
│   └── e2e/                           # Playwright
│       └── smoke.spec.ts
├── index.html
├── vite.config.ts                     # Incl. vite-plugin-pwa config
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Design tokens (extracted from prototype)

Ported verbatim from `/Users/tommorskieft/Downloads/dart-counter/project/lib/ui.jsx` and cross-checked against the iOS `DS` enum.

```css
/* src/styles/tokens.css */
:root {
  color-scheme: dark;

  /* Palette — pub / cafe */
  --ds-bg: #14100d; /* warm brown-black */
  --ds-bg-2: #1d1814; /* walnut */
  --ds-bg-3: #26201b; /* leather */
  --ds-text: #f4ece0; /* cream */
  --ds-muted: rgba(244, 236, 224, 0.6);
  --ds-dim: rgba(244, 236, 224, 0.35);

  --ds-accent: oklch(0.62 0.22 25); /* bullseye red */
  --ds-accent-dim: oklch(0.48 0.18 25);
  --ds-accent-glow: oklch(0.62 0.22 25 / 0.35);

  --ds-green: oklch(0.62 0.14 155); /* dartboard green */
  --ds-green-dim: oklch(0.48 0.12 155);
  --ds-green-glow: oklch(0.62 0.14 155 / 0.3);

  --ds-brass: oklch(0.75 0.12 75); /* warm highlight */
  --ds-border: rgba(220, 190, 160, 0.09);
  --ds-border-2: rgba(220, 190, 160, 0.18);

  /* App background gradient (from prototype App.jsx) */
  --ds-app-bg: radial-gradient(ellipse at top, #2a1a12 0%, #150e09 45%, #080503 100%);

  /* Typography */
  --ds-font-display: 'Archivo', -apple-system, system-ui, sans-serif;
  --ds-font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, monospace;

  /* Sizing */
  --ds-button-h: 56px;
  --ds-button-sm-h: 44px;
  --ds-button-xs-h: 36px;
  --ds-input-h: 52px;
  --ds-input-lg-h: 56px;

  /* Radii */
  --ds-radius-sm: 9px;
  --ds-radius-md: 12px;
  --ds-radius-lg: 14px;
  --ds-radius-xl: 18px;
  --ds-radius-sheet: 24px;

  /* Spacing */
  --ds-edge-padding: 24px;
}
```

Tailwind `theme.extend` maps these into the `--ds-*` namespace as utilities (`bg-ds-bg`, `text-ds-muted`, `rounded-ds-lg`, `font-display`, `font-mono`).

Text components (exact spec from prototype):

| Component    | Spec                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| `<Eyebrow>`  | JetBrains Mono 11px / weight 500 / letter-spacing 2.5 / uppercase / `--ds-muted`         |
| `<Heading>`  | Archivo 32px default / weight 800 / line-height 1.02 / letter-spacing -0.8 / `--ds-text` |
| `<BodyText>` | Archivo 15px / line-height 1.45 / weight 400 / `--ds-muted`                              |

---

## 5. Data model (Dexie / IndexedDB)

Ported from SwiftData with minimal changes — no `user_id` needed (single-user, single-device).

```ts
// src/db/database.ts
export interface Profile {
  id: 1 // singleton
  firstName: string
  lastName: string
  birthday?: string // ISO date
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  soundsEnabled: boolean
  createdAt: number // unix ms
}

export interface Match {
  id?: number // auto
  playedAt: number
  gameType: 'checkout121' | 'standardCheckout' | 'barneys'
  // 121
  finalTarget?: number
  maxDarts?: number
  rounds?: number // null = endless
  // Standard
  startScore?: 501 | 301 | 201 | 101
  legsTarget?: number // null = endless
  legsWon?: number
  finishedInDarts?: number
  threeDartAverage?: number
  // Barney's
  barneysScore?: number
}

export interface Round {
  id?: number
  matchId: number
  roundNumber: number
  target: number
  success: boolean
  dartsUsed: number
}

export interface Turn {
  id?: number
  roundId: number
  turnNumber: number
  dartsThrown: 1 | 2 | 3
  scoreThrown: number
  remainingAfter: number
  isBust: boolean
  // Optional per-dart detail — enables segment heatmap
  dartsDetail?: Array<{ value: number; multiplier: 1 | 2 | 3 }>
}
```

Indexes: `matches(playedAt, gameType)`, `rounds(matchId+roundNumber)`, `turns(roundId+turnNumber)`.

Seed: CheckoutChart is a pure const in code (not a table), matching the iOS approach.

---

## 6. Game engines port (pure TS)

`src/game/` folder — 1:1 port of iOS `Game/`:

- `DartNotation.ts` — `Single(1..20 | 25)` / `Double(1..20)` / `Treble(1..20)` / `Bullseye`, with `.points`, `.shortLabel` ('T20', 'D16', 'BULL'), `.finishesCheckout` (true for doubles/bull), parse from short label.
- `CheckoutChart.ts` — full 170→2 map, ported verbatim from `lib/checkouts.js` (identical to iOS `CheckoutChart.swift`).
- `CheckoutEngine.ts` — `route(score) → { kind: 'done' | 'bust' | 'noOut' | 'route', darts?: DartNotation[] }`. No-out scores: 169, 168, 166, 165, 163, 162, 159. Bust: score == 1. Range: 2–170.
- `GameMode.ts` — discriminated union with `typeId` / `typeLabel` / `title` / `blurb` / defaults / `allDisplayModes`.

Pinia stores (one per mode — transient live-game state):

- `stores/checkout121.ts` — `target`, `remaining`, `dartsUsed`, `roundIndex`, `turns[]` (current round), `history[]`, `status`, `confettiTrigger`. Actions: `submit(score, dartsThrown)`, `undo()`, `quit()`. Getters: `dartsRemainingThisRound`, `currentRoute` (via CheckoutEngine).
- `stores/standardCheckout.ts` — `startScore`, `legsTarget`, `remaining`, `turns[]`, `status`, `completedResult`. Checkout only on a double (via `DartNotation.finishesCheckout`). Multi-leg. Bust resets remaining to pre-turn value.
- `stores/barneys.ts` — `currentTargetIndex` (0–6), `currentHits[]` (0–3 per target), `pastRounds[]`, `completedResult`. No bust logic.

**Vitest coverage:** 170-checkout path, 169/168/166/165/163/162/159 no-out, bust on 1, bust on non-double finish, 501 multi-leg transition, Barney's 21-dart full run.

---

## 7. PWA — making it feel native

### 7a. `public/manifest.webmanifest`

```json
{
  "name": "One·Two·One — Darts Practice",
  "short_name": "One·Two·One",
  "description": "121 checkout, 501, and accuracy drills. Offline-first.",
  "id": "/dartscounter/",
  "start_url": "/dartscounter/",
  "scope": "/dartscounter/",
  "display": "standalone",
  "display_override": ["standalone", "fullscreen", "minimal-ui"],
  "orientation": "portrait",
  "background_color": "#14100D",
  "theme_color": "#14100D",
  "categories": ["games", "sports", "lifestyle"],
  "icons": [
    { "src": "/dartscounter/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/dartscounter/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/dartscounter/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/dartscounter/icons/icon-monochrome-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "monochrome"
    }
  ],
  "shortcuts": [
    {
      "name": "Play 121",
      "short_name": "121",
      "url": "/dartscounter/play/setup?mode=checkout121",
      "icons": [{ "src": "/dartscounter/icons/shortcut-121.png", "sizes": "192x192" }]
    },
    {
      "name": "Play 501",
      "short_name": "501",
      "url": "/dartscounter/play/setup?mode=standardCheckout",
      "icons": [{ "src": "/dartscounter/icons/shortcut-501.png", "sizes": "192x192" }]
    },
    {
      "name": "Barney's Drill",
      "short_name": "Barney's",
      "url": "/dartscounter/play/setup?mode=barneys",
      "icons": [{ "src": "/dartscounter/icons/shortcut-barneys.png", "sizes": "192x192" }]
    }
  ]
}
```

### 7b. `<head>` meta — index.html

```html
<!-- Primary -->
<meta name="theme-color" content="#14100D" />
<meta name="color-scheme" content="dark" />
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
/>
<link rel="manifest" href="/dartscounter/manifest.webmanifest" />

<!-- iOS -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="One·Two·One" />
<link rel="apple-touch-icon" sizes="180x180" href="/dartscounter/icons/apple-touch-icon-180.png" />
<link rel="apple-touch-icon" sizes="167x167" href="/dartscounter/icons/apple-touch-icon-167.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/dartscounter/icons/apple-touch-icon-152.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/dartscounter/icons/apple-touch-icon-120.png" />
<!-- Splash screens generated for iPhone 15 Pro Max / Pro / 15 / SE / etc. -->
<!-- (generated by pwa-asset-generator in phase 8) -->

<!-- Android / Chrome -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="application-name" content="One·Two·One" />

<!-- Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/dartscounter/icons/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/dartscounter/icons/favicon-16.png" />
<link rel="mask-icon" href="/dartscounter/icons/safari-pinned-tab.svg" color="#E53228" />

<!-- Windows tiles -->
<meta name="msapplication-TileColor" content="#14100D" />

<!-- OG / Twitter -->
<meta property="og:type" content="website" />
<meta property="og:title" content="One·Two·One — Darts Practice" />
<meta property="og:description" content="121 checkout, 501, and accuracy drills." />
<meta property="og:image" content="/dartscounter/icons/og-image-1200.png" />
<meta name="twitter:card" content="summary_large_image" />
```

### 7c. Service worker (vite-plugin-pwa)

- `registerType: 'autoUpdate'`
- Precache: the app shell, JS chunks, CSS, all fonts, all icons, all sounds — the entire working app is available offline.
- Runtime strategy: single-user app, no remote data, so no runtime cache needed. Everything ships in the precache.
- Update toast when a new SW is waiting: "Update available — reload".

### 7d. Icons & splash screens

One 1024×1024 master SVG (red+green alternating bullseye rings on `#14100D`) in `design/icon-master.svg`, generated from the prototype's `BullseyeMark`. Script: `pnpm run icons` runs:

1. `sharp-cli` to emit PNG sizes: 16, 32, 120, 152, 167, 180, 192, 512 + maskable-512 + monochrome-512 + og-1200
2. `pwa-asset-generator` for Apple splash screens per device size (iPhone 15/14/13/SE/Pro Max)

All output committed under `public/icons/` and `public/splash/` (design choice: reproducible + inspectable over a generated-on-CI approach).

---

## 8. Performance analytics — what we record and show

> **Not** web/user-behaviour analytics. **Your darts performance**, stored locally, visualised in the Stats screen.

### 8a. What we capture per turn (already in the data model)

- Turn-level: darts thrown, score thrown, remaining after, bust flag
- Optional per-dart detail (`dartsDetail`): `{ value: 20, multiplier: 3 }` — enables heatmaps. Input method TBD in Phase 5 (segmented dart-by-dart input vs. total-only). Default to total-only for speed; add per-dart as a Phase 6 enhancement if you want heatmaps.

### 8b. What we compute and show (Stats screen)

**Overall / career:**

- Matches played, rounds played, checkouts hit, checkout rate %
- Highest out, fewest darts to check out, best streak, highest target (121 mode)
- Total darts thrown

**Per mode — 121 Checkout:**

- Target reached, target trend line
- Checkout rate by target range (121-140, 141-160, 161+)
- Average darts-per-checkout

**Per mode — Standard (501 etc.):**

- 3-dart average (current, best match, rolling 10-match)
- **First-9-dart average** (separate from overall)
- Checkout rate %
- Legs won, match win rate
- 180s count, 140+ count, 100+ count, 60+ count
- Average darts-per-leg
- Scoring distribution histogram

**Per mode — Barney's Drill:**

- Best score (out of 63)
- Average score, trend
- Per-target hit rate (20 / 19 / 18 / 17 / 16 / 15 / bull)
- Double % and treble % per target

**Segment heatmap** (only if per-dart input enabled):

- Visual dartboard — hit density by segment × ring
- Highlight weakest and strongest segments

**Trend charts (SVG, custom):**

- 3-dart average over last 30 days
- Checkout rate over last 30 days
- One chart per key metric, per mode

---

## 9. Phases and branches

All via GitHub: branch → commits → push → PR → squash-merge → delete branch. Project-scoped `CLAUDE.md` (added in Phase 0) overrides the global "never commit" rule for this repo only.

| #     | Branch                        | Scope                                                                                                                                                                                                                                                           | Exit criteria                                                                                                                                                                                                       |
| ----- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | `phase/00-bootstrap`          | Vite + Vue 3 + TS + Tailwind scaffolding, router, Pinia, Dexie, Vitest, Playwright, ESLint/Prettier, GH Actions deploy workflow to `gh-pages`, project-scoped `CLAUDE.md`, design reference copy into `design/reference/`, README                               | `pnpm dev` renders "Hello" on `http://localhost:5173/dartscounter/`; `pnpm build` + `pnpm preview` works; first Actions deploy publishes a live blank page to `https://tommorskieft-stimmt.github.io/dartscounter/` |
| **1** | `phase/01-design-system`      | `tokens.css`, `fonts.css`, Tailwind theme extension, every `design-system/*` Vue component, `BullseyeMark.vue`, `ConfettiBurst.vue`, dev-only `/gallery` route to preview every component                                                                       | Every component renders correctly in dark theme, types on all components, gallery visually matches prototype                                                                                                        |
| **2** | `phase/02-onboarding-profile` | `db/database.ts` with Profile table, Onboarding 3-step flow, Profile screen, LevelSheet, Acknowledgements, Sounds toggle                                                                                                                                        | First visit → onboarding → `/`; subsequent visits → `/`; profile editable, persists across reloads                                                                                                                  |
| **3** | `phase/03-data-model-match`   | Match / Round / Turn tables, repositories, seeder for dev (`pnpm seed:demo` adds 50 demo matches)                                                                                                                                                               | `db.matches.toArray()` returns demo data in dev; schema migration version pinned                                                                                                                                    |
| **4** | `phase/04-game-engines`       | `DartNotation.ts`, `CheckoutChart.ts`, `CheckoutEngine.ts`, `GameMode.ts`, three Pinia stores, Vitest suites with ≥ 90% branch coverage on engines                                                                                                              | All Vitest specs pass; includes every no-out case, 170 path, double-out rule, Barney's full run                                                                                                                     |
| **5** | `phase/05-gameplay-ui`        | `PlaySetup.vue` (per-mode setup sections), `PlayLive.vue` dispatcher, three `*Live.vue` mode views, `ScoreboardCard`, `TurnInputCard`, `TurnLogList`, `CheckoutHelperSheet`, undo button, quit flow, vibration API on key events, match persistence on finish   | Full end-to-end gameplay loop in all three modes; haptic + confetti on checkout; undo restores within round                                                                                                         |
| **6** | `phase/06-game-over`          | `PlayOver.vue` + three mode over-views, round tiles, confetti, summary stat grid                                                                                                                                                                                | Every mode shows the correct end-of-match summary                                                                                                                                                                   |
| **7** | `phase/07-stats`              | `Stats.vue` host with mode tabs, overall + per-mode views, `TrendLineChart.vue`, `StatTile` grid, performance-analytics aggregator (§8)                                                                                                                         | Stats numbers match iOS computation on same seed data                                                                                                                                                               |
| **8** | `phase/08-pwa-polish`         | manifest.webmanifest, full meta tag set, icon generation pipeline (`pnpm run icons`), Apple splash screens, vite-plugin-pwa precache, update toast                                                                                                              | Lighthouse PWA score ≥ 95 on mobile; Chrome & Safari both install to home screen; launched app runs standalone; full app works in airplane mode after first visit                                                   |
| **9** | `phase/09-final-polish`       | Accessibility pass (focus rings, ARIA labels, reduced-motion respect), sound MP3 conversion + bundling, copy pass, home `RecommendationCard`, README finalisation, Playwright smoke (onboarding → play 121 → finish), per-dart input mode for heatmap (stretch) | Lighthouse Accessibility ≥ 95; Playwright smoke green                                                                                                                                                               |

Per-phase workflow: `git checkout main && git pull` → `git checkout -b phase/NN-xxx` → commits → `git push -u origin phase/NN-xxx` → `gh pr create` → self-review → `gh pr merge --squash --delete-branch`.

---

## 10. Explicit non-goals

- No user accounts, no auth, no backend, no server.
- No multiplayer, no leaderboards, no social features.
- No web/user-behaviour analytics, no tracking scripts.
- No push notifications.
- No Capacitor / TWA wrapper (PWA is enough; revisit only if the PWA can't do something we need).
- No iOS data import (fresh slate, confirmed).
- No breaking schema migrations — additive only.

---

## 11. Open items before Phase 0 starts

None — plan is complete. Awaiting Tom's "proceed."
