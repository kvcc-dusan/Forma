import { computeTarget } from './progression'
import { getDay, getExercise, isLiftingDay } from './program'
import { localDate, todayISO } from './utils'
import type { SessionLog } from './types'

// The in-flight workout. Lives in localStorage so a phone lock, tab kill, or
// reload mid-session loses nothing. Exactly one live session at a time;
// cleared when the session is saved or discarded.

const KEY = 'forma-live-session'

export interface LiveSet {
  reps: number
  loadKg: number
  done: boolean
}

export interface LiveExercise {
  // The slot in the program day this entry fills (stable across substitution).
  originalId: string
  // The exercise actually being performed (differs when substituted).
  exerciseId: string
  repRange: [number, number]
  sets: LiveSet[]
}

export interface LiveSession {
  dayId: string
  date: string // yyyy-mm-dd local — a live session belongs to one day
  startedAt: string // ISO
  warmupDone: boolean
  currentIndex: number
  exercises: LiveExercise[] // empty for cardio sessions
}

export const readLiveSession = (): LiveSession | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as LiveSession
    // A stale session from a previous day is discarded, not resumed.
    return session.date === localDate() ? session : null
  } catch {
    return null
  }
}

export const writeLiveSession = (session: LiveSession): void => {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export const clearLiveSession = (): void => {
  localStorage.removeItem(KEY)
}

// Build a fresh live session for a program day, prefilled from progression:
// reps = today's target, load = last session's working load (or none).
export const createLiveSession = (
  dayId: string,
  sessions: SessionLog[],
): LiveSession => {
  const day = getDay(dayId)
  const exercises: LiveExercise[] = []

  if (day && isLiftingDay(day)) {
    for (const dx of day.exercises) {
      const target = computeTarget(dx, sessions)
      const load = target.loadKg ?? 0
      exercises.push({
        originalId: dx.exerciseId,
        exerciseId: dx.exerciseId,
        repRange: dx.repRange,
        sets: Array.from({ length: dx.sets }, () => ({
          reps: target.repsTarget,
          loadKg: load,
          done: false,
        })),
      })
    }
  }

  const session: LiveSession = {
    dayId,
    date: localDate(),
    startedAt: todayISO(),
    warmupDone: false,
    currentIndex: 0,
    exercises,
  }
  writeLiveSession(session)
  return session
}

// Substitute an exercise (this session only). Sets keep their entered data
// only if untouched; a swap resets reps/load to the substitute's fresh state.
export const substituteInLiveSession = (
  session: LiveSession,
  originalId: string,
  substituteId: string,
  allSessions: SessionLog[],
): LiveSession => {
  const day = getDay(session.dayId)
  if (!day || !isLiftingDay(day)) return session
  const dx = day.exercises.find((e) => e.exerciseId === originalId)
  if (!dx || !getExercise(substituteId)) return session

  const target = computeTarget({ ...dx, exerciseId: substituteId }, allSessions)
  const next: LiveSession = {
    ...session,
    exercises: session.exercises.map((ex) =>
      ex.originalId === originalId
        ? {
            ...ex,
            exerciseId: substituteId,
            sets: ex.sets.map((s) => ({
              ...s,
              reps: s.done ? s.reps : target.repsTarget,
              loadKg: s.done ? s.loadKg : (target.loadKg ?? 0),
            })),
          }
        : ex,
    ),
  }
  writeLiveSession(next)
  return next
}
