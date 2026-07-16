import { getDay, getExercise, isLiftingDay } from './program'
import { localDate, todayISO } from './utils'

// The in-flight workout. Lives in localStorage so a phone lock, tab kill, or
// reload mid-session loses nothing. Exactly one live session at a time;
// cleared when the session is saved or discarded.
//
// Read-first design: no per-set data is collected — an exercise is simply
// done or not done.

const KEY = 'forma-live-session'

export interface LiveExercise {
  // The slot in the program day this entry fills (stable across substitution).
  originalId: string
  // The exercise actually being performed (differs when substituted).
  exerciseId: string
  sets: number
  repRange: [number, number]
  done: boolean
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
    // A stale session from a previous day (or the old per-set shape) is
    // discarded, not resumed.
    if (session.date !== localDate()) return null
    if (session.exercises.some((e) => typeof e.done !== 'boolean')) return null
    return session
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

export const createLiveSession = (dayId: string): LiveSession => {
  const day = getDay(dayId)
  const exercises: LiveExercise[] =
    day && isLiftingDay(day)
      ? day.exercises.map((dx) => ({
          originalId: dx.exerciseId,
          exerciseId: dx.exerciseId,
          sets: dx.sets,
          repRange: dx.repRange,
          done: false,
        }))
      : []

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

// Substitute an exercise, this session only.
export const substituteInLiveSession = (
  session: LiveSession,
  originalId: string,
  substituteId: string,
): LiveSession => {
  if (!getExercise(substituteId)) return session
  const next: LiveSession = {
    ...session,
    exercises: session.exercises.map((ex) =>
      ex.originalId === originalId ? { ...ex, exerciseId: substituteId } : ex,
    ),
  }
  writeLiveSession(next)
  return next
}
