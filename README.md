# Forma — Personal Training PWA

A data-driven, offline-first, installable training app for one user's
Push/Pull/Legs program. No backend, no accounts, no analytics — everything
lives on the device.

## Stack

- React 19 + TypeScript + Tailwind v4 + Vite
- `vite-plugin-pwa` (autoUpdate) — offline app shell, installable
- `idb` (IndexedDB) for session logs and bodyweight history
- `recharts` for Progress charts
- `react-router-dom` for navigation

## The two files that drive everything

- `src/data/program.json` — days (Push / Pull / Legs + Zone 2), progression
  rules, warm-up/cool-down, heart-safe constraints, survey schema.
- `src/data/exercise-library.json` — exercise catalog (cues, heart-safe notes,
  substitutions, equipment, muscles).

Nothing about the program is hardcoded in components. **Updating the program =
edit JSON, push, Netlify redeploys.**

## How it works

- **Home** — week calendar strip (done ✓ / missed ✕ / today / planned / rest)
  plus a today card with one-tap session start and an up-next preview.
- **Scheduling** ([schedule.ts](src/lib/schedule.ts)) — flexible push-forward
  rotation. Lifting days rotate Push → Pull → Legs with at least one rest day
  between; a missed day shifts the whole queue forward; Zone 2 slots onto a
  rest day once per week. Pure derivation from logs — no stored calendar.
- **Train** — live set-by-set logging: targets prefilled by the
  double-progression engine, rest timer auto-starts after each set,
  session-only exercise substitutions, everything persisted to localStorage
  so a phone lock or reload loses nothing. Finish = schema-driven survey
  (RPE, energy, mood, palpitations, pain, notes) → IndexedDB.
- **Progression** ([progression.ts](src/lib/progression.ts)) — double
  progression: all working sets at the top of the rep range → +2.5 kg upper /
  +5 kg lower, reps reset to the bottom; otherwise same load, reps climb.
- **Progress** — per-exercise top-set load, weekly summary, session
  completion, bodyweight 7-day moving average, energy/mood trends. No BMI.
- **Settings** — program overview, full heart-safe constraints, theme,
  JSON backup export, data reset.

Heart-safe by design: RIR 1–2 caps, no sub-6-rep work, mandatory warm-up and
cool-down cards, distinct amber safety blocks, palpitation logging. No HIIT,
no intervals, no AMRAP, no 1RM features.

## Develop

```bash
npm install
npm run dev        # local dev server
npm run build      # tsc + vite build -> dist/
npm run preview    # serve the production build (service worker active)
```

## Deploy

Netlify from this repo: build `npm run build`, publish `dist` (configured in
`netlify.toml`). After the first load on the phone the app is installable
(Add to Home Screen) and fully functional offline.

## Out of scope

Nutrition, supplements, blood markers (separate app: Ordo Corpus).
