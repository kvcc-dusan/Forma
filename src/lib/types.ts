// Domain types. Shapes are derived from the two source-of-truth JSON files
// (src/data/exercise-library.json and src/data/program.json) plus the local
// IndexedDB log shapes. No program content is hardcoded here — only structure.

export type Pattern = string

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'

export type Skill = 'low' | 'medium' | 'high'

export interface Exercise {
  id: string
  name: string
  pattern: Pattern
  equipment: Equipment
  primaryMuscles: string[]
  skill: Skill
  cues: string[]
  heartSafe: string[]
  substitutions: string[] // exercise ids
}

export interface ExerciseLibrary {
  schemaVersion: number
  exercises: Exercise[]
}

export interface DayExercise {
  exerciseId: string
  sets: number
  repRange: [number, number]
}

export interface LiftingDay {
  id: string
  name: string
  type: 'lifting'
  exercises: DayExercise[]
}

export interface CardioDay {
  id: string
  name: string
  type: 'cardio'
  durationMin: number
  targetHrPct: [number, number]
  guidance: string
}

export type ProgramDay = LiftingDay | CardioDay

export interface Progression {
  model: string
  incrementUpperKg: number
  incrementLowerKg: number
  rule: string
  appBehavior: string
}

export interface Warmup {
  cardioMin: number
  cardioNote: string
  rampSets: string
  cooldownMin: number
  cooldownNote: string
}

export interface Constraints {
  id: string
  rules: string[]
}

export interface ProgramMeta {
  name: string
  phase: string
  split: string
  globalRir: [number, number]
  defaultRestSec: number
  accessoryRestSec: number
  notes: string
}

export type SurveyFieldType =
  | 'exercise-log'
  | 'scale'
  | 'boolean'
  | 'number'
  | 'text'

export interface SurveyField {
  key: string
  type: SurveyFieldType
  label?: string
  description?: string
  min?: number
  max?: number
  showIf?: string
}

export interface Survey {
  fields: SurveyField[]
}

export interface Program {
  schemaVersion: number
  meta: ProgramMeta
  progression: Progression
  warmup: Warmup
  constraints: Constraints
  days: ProgramDay[]
  survey: Survey
}

// ----- Local log shapes (IndexedDB) -----

export interface SetLog {
  reps: number
  loadKg: number
}

export interface ExerciseLog {
  exerciseId: string
  completed: boolean
  sets: SetLog[]
}

export interface SessionLog {
  id: string // uuid
  dayId: string // "A" | "B" | "C" | "zone2"
  date: string // ISO
  perExercise: ExerciseLog[]
  sessionRpe?: number // 1-10
  energy?: number // 1-5
  mood?: number // 1-5
  palpitations?: boolean
  palpitationsNote?: string
  painFlag?: boolean
  painNote?: string
  durationMin?: number
  notes?: string
}

export interface BodyweightEntry {
  id: string // uuid
  date: string // ISO date (yyyy-mm-dd)
  kg: number
}

// ----- Schedule (derived, never stored) -----

export type DayStatus = 'done' | 'missed' | 'planned' | 'rest'

export interface PlannedDay {
  date: string // yyyy-mm-dd, local timezone
  dayId: string | null // program day id, null on rest days
  status: DayStatus
  isToday: boolean
}

// ----- Derived / view-model shapes -----

export type LoadGroup = 'upper' | 'lower'

export interface ProgressionTarget {
  exerciseId: string
  repRange: [number, number]
  // The recommended load for today, or null when there is no history yet.
  loadKg: number | null
  // Reps to aim for on each working set today.
  repsTarget: number
  // True when last session cleared the top of the range on all sets, so the
  // load is being bumped and reps reset to the bottom.
  loadIncreased: boolean
  increment: number
  group: LoadGroup
  // The most recent log for this exercise, for "last time" display.
  last: ExerciseLog | null
  lastDate: string | null
}
