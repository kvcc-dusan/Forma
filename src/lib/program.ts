import programJson from '@/data/program.json'
import libraryJson from '@/data/exercise-library.json'
import type {
  CardioDay,
  DayExercise,
  Exercise,
  ExerciseLibrary,
  LiftingDay,
  Program,
  ProgramDay,
} from './types'

// Single typed entry point to the two source-of-truth JSON files. The whole app
// reads the program through these helpers so swapping the JSON is the only
// change needed between program updates.

export const program = programJson as unknown as Program
export const library = libraryJson as unknown as ExerciseLibrary

const exerciseIndex: Record<string, Exercise> = Object.fromEntries(
  library.exercises.map((e) => [e.id, e]),
)

export const getExercise = (id: string): Exercise | undefined =>
  exerciseIndex[id]

export const liftingDays = program.days.filter(
  (d): d is LiftingDay => d.type === 'lifting',
)

export const cardioDays = program.days.filter(
  (d): d is CardioDay => d.type === 'cardio',
)

export const getDay = (id: string): ProgramDay | undefined =>
  program.days.find((d) => d.id === id)

export const isLiftingDay = (d: ProgramDay): d is LiftingDay =>
  d.type === 'lifting'

// Resolve a list of substitution ids to exercises that actually exist in the
// library (the library references a few subs that aren't catalogued yet).
export const resolveSubstitutions = (ids: string[]): Exercise[] =>
  ids.map((id) => exerciseIndex[id]).filter((e): e is Exercise => Boolean(e))

// ----- time estimates -----

const WORK_SECONDS_PER_SET = 40

// Rest between sets: accessories/core use the shorter accessory rest.
export const restSecondsFor = (exerciseId: string): number => {
  const ex = exerciseIndex[exerciseId]
  return ex && (ex.pattern.startsWith('accessory') || ex.pattern === 'core')
    ? program.meta.accessoryRestSec
    : program.meta.defaultRestSec
}

export const estimateExerciseMinutes = (dx: DayExercise): number =>
  Math.max(
    1,
    Math.round(
      (dx.sets * (WORK_SECONDS_PER_SET + restSecondsFor(dx.exerciseId))) / 60,
    ),
  )

export const estimateDayMinutes = (day: ProgramDay): number => {
  if (day.type === 'cardio') return day.durationMin
  const lifting = day.exercises.reduce(
    (sum, dx) => sum + estimateExerciseMinutes(dx),
    0,
  )
  return program.warmup.cardioMin + lifting + program.warmup.cooldownMin
}
