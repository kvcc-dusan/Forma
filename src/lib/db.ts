import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BodyweightEntry, ExerciseLog, SessionLog } from './types'

// Offline-first persistence. All training history lives here in the browser —
// no backend, no sync. Sessions and bodyweight entries are the only mutable
// state; everything else is read from the bundled JSON.

interface FormaDB extends DBSchema {
  sessions: {
    key: string
    value: SessionLog
    indexes: { 'by-date': string; 'by-day': string }
  }
  bodyweight: {
    key: string
    value: BodyweightEntry
    indexes: { 'by-date': string }
  }
}

const DB_NAME = 'forma'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<FormaDB>> | null = null

const getDB = (): Promise<IDBPDatabase<FormaDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<FormaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' })
        sessions.createIndex('by-date', 'date')
        sessions.createIndex('by-day', 'dayId')

        const bodyweight = db.createObjectStore('bodyweight', {
          keyPath: 'id',
        })
        bodyweight.createIndex('by-date', 'date')
      },
    })
  }
  return dbPromise
}

export const uuid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`

// ----- Sessions -----

export const addSession = async (session: SessionLog): Promise<void> => {
  const db = await getDB()
  await db.put('sessions', session)
}

export const getAllSessions = async (): Promise<SessionLog[]> => {
  const db = await getDB()
  const all = await db.getAllFromIndex('sessions', 'by-date')
  // by-date index is ascending; newest last. Return newest-first.
  return all.reverse()
}

export const deleteSession = async (id: string): Promise<void> => {
  const db = await getDB()
  await db.delete('sessions', id)
}

// Most recent log for a given exercise across all stored sessions, newest first.
export const getLastExerciseLog = (
  sessions: SessionLog[],
  exerciseId: string,
): { log: ExerciseLog; date: string } | null => {
  for (const s of sessions) {
    const log = s.perExercise.find((e) => e.exerciseId === exerciseId)
    if (log && log.sets.length > 0) return { log, date: s.date }
  }
  return null
}

// ----- Bodyweight -----

export const addBodyweight = async (
  entry: BodyweightEntry,
): Promise<void> => {
  const db = await getDB()
  await db.put('bodyweight', entry)
}

export const getAllBodyweight = async (): Promise<BodyweightEntry[]> => {
  const db = await getDB()
  const all = await db.getAllFromIndex('bodyweight', 'by-date')
  return all // ascending by date
}

export const deleteBodyweight = async (id: string): Promise<void> => {
  const db = await getDB()
  await db.delete('bodyweight', id)
}

export const clearAllData = async (): Promise<void> => {
  const db = await getDB()
  await db.clear('sessions')
  await db.clear('bodyweight')
}
