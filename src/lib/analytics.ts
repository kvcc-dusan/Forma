import { formatShortDate } from './utils'
import type { SessionLog } from './types'

// Pure data shaping for the Progress charts, computed from stored sessions.

export interface PointXY {
  date: string // ISO
  label: string // short display
  value: number
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
