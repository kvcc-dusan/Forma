# Forma — Personalized Training PWA

A data-driven, offline-first, installable PWA for a single user's heart-safe
training program. Built on the V0 "Forma" visual reference, rebuilt as a Vite
SPA with no backend, no auth, and no running cost.

## Stack

- React 19 + TypeScript + Tailwind v4 + Vite
- `vite-plugin-pwa` (autoUpdate) — offline app shell + data precache
- `idb` (IndexedDB) for session logs and bodyweight history
- `recharts` for the Progress charts
- `react-router-dom` for navigation

## The two files that drive everything

The whole app renders from two source-of-truth JSON files. **Updating the
program is a file swap + redeploy — no code changes.**

- `src/data/program.json` — days (A/B/C rotation + Zone 2), progression rules,
  warm-up/cool-down, heart-safe constraints, and the post-session survey schema.
- `src/data/exercise-library.json` — the exercise catalog (cues, heart-safe
  notes, substitutions, equipment, muscles).

Nothing about the program is hardcoded in components. Edit the JSON, run
`npm run build`, redeploy.

## How it works

- **Today** resolves the next day in the A → B → C rotation from your most
  recent completed lifting session (Zone 2 never advances the counter). Each
  exercise shows its target from the double-progression engine plus last
  session's numbers. Substitute per exercise (this session only), rest timer,
  warm-up/cool-down reminders.
- **Exercise detail** — cues, primary muscles, and an always-visible heart-safe
  safety block; substitution list.
- **Log session** — generated from `program.json.survey.fields`. The
  exercise-log pre-fills from today's prescription (reps = target, load = last
  session's load). On submit it writes a `SessionLog` to IndexedDB and the
  rotation advances automatically.
- **Progress** — per-exercise top-set load, session completion rate, bodyweight
  7-day moving average (manual weekly entries), and energy/mood trends.
- **Settings** — program info, full heart-safe constraints, theme, and a local
  JSON backup export / data reset. All data stays on the device.

### Progression engine (`src/lib/progression.ts`)

Double progression: when every working set hit the top of the rep range at the
working load, the load bumps by the relevant increment (upper vs lower body, by
the exercise's pattern/muscles) and reps reset to the bottom. Otherwise reps
climb toward the top at the same load. No history → no load suggestion (set the
starting load at RIR 2).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc + vite build -> dist/
npm run preview    # serve the production build
```

## Deploy (Netlify, static)

Build command `npm run build`, publish directory `dist`. SPA routing and the
service-worker offline fallback are configured in `netlify.toml` and
`public/_redirects`. After the first load the app works fully offline and is
installable to a phone home screen.

## Out of scope

Nutrition, supplements, blood markers (those live in Ordo Corpus). No BMI, no
HIIT/interval/AMRAP/failure/1RM features — by design.
