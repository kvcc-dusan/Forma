import { getExercise } from './program'
import { formatShortDate } from './utils'
import type { BodyweightEntry, SessionLog } from './types'

// Pure data shaping for the Progress charts. Everything is computed from stored
// sessions + bodyweight entries — no derived state is persisted.

export interface PointXY {
  date: string // ISO
  label: string // short display
  value: number
}

// Distinct exercises that appear in history, newest activity first, for the
// per-exercise chart selector.
export const loggedExercises = (
  sessions: SessionLog[],
): { id: string; name: string }[] => {
  const seen = new Map<string, string>()
  for (const s of sessions) {
    for (const e of s.perExercise) {
      if (!seen.has(e.exerciseId)) {
        const ex = getExercise(e.exerciseId)
        seen.set(e.exerciseId, ex?.name ?? e.exerciseId)
      }
    }
  }
  return [...seen.entries()].map(([id, name]) => ({ id, name }))
}

// Top-set load by date for one exercise, oldest -> newest.
export const loadSeries = (
  sessions: SessionLog[],
  exerciseId: string,
): PointXY[] => {
  const points: PointXY[] = []
  for (const s of sessions) {
    const log = s.perExercise.find((e) => e.exerciseId === exerciseId)
    if (!log || log.sets.length === 0) continue
    const top = log.sets.reduce((m, set) => Math.max(m, set.loadKg), 0)
    points.push({ date: s.date, label: formatShortDate(s.date), value: top })
  }
  return points.reverse() // sessions are newest-first
}

// Per-session completion rate (% of prescribed exercises marked completed).
export const completionSeries = (sessions: SessionLog[]): PointXY[] =>
  [...sessions]
    .reverse()
    .filter((s) => s.perExercise.length > 0)
    .map((s) => {
      const done = s.perExercise.filter((e) => e.completed).length
      const pct = Math.round((done / s.perExercise.length) * 100)
      return { date: s.date, label: formatShortDate(s.date), value: pct }
    })

// A scalar survey field (mood/energy/rpe) by date, oldest -> newest.
export const scalarSeries = (
  sessions: SessionLog[],
  key: 'mood' | 'energy' | 'sessionRpe',
): PointXY[] =>
  [...sessions]
    .reverse()
    .filter((s) => typeof s[key] === 'number')
    .map((s) => ({
      date: s.date,
      label: formatShortDate(s.date),
      value: s[key] as number,
    }))

// 7-day trailing moving average of bodyweight. Returns one MA point per entry
// date (using entries within the trailing 7-day window), oldest -> newest.
export const bodyweightMovingAverage = (
  entries: BodyweightEntry[],
): PointXY[] => {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const out: PointXY[] = []
  for (let i = 0; i < sorted.length; i++) {
    const end = new Date(sorted[i].date).getTime()
    const windowStart = end - 6 * 86_400_000
    const window = sorted.filter((e) => {
      const t = new Date(e.date).getTime()
      return t >= windowStart && t <= end
    })
    const avg =
      window.reduce((sum, e) => sum + e.kg, 0) / Math.max(1, window.length)
    out.push({
      date: sorted[i].date,
      label: formatShortDate(sorted[i].date),
      value: Math.round(avg * 10) / 10,
    })
  }
  return out
}
