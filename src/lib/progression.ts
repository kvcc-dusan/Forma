import { getExercise, program } from './program'
import { getLastExerciseLog } from './db'
import type {
  DayExercise,
  Exercise,
  LoadGroup,
  ProgressionTarget,
  SessionLog,
} from './types'

// Double progression, exactly per program.json.progression.
//
//  - All working sets hit the top of the range at the working load
//      -> bump load by the relevant increment, reset reps to the bottom.
//  - Otherwise
//      -> keep the load, push reps one step toward the top.
//  - No history
//      -> show the rep range, no load suggestion (user sets RIR-2 start load).

const LOWER_PATTERNS = new Set([
  'squat',
  'hinge',
  'accessory-hamstring',
])

const LOWER_MUSCLES = new Set([
  'quadriceps',
  'glutes',
  'hamstrings',
  'calves',
])

// Classify an exercise as upper- or lower-body to pick the load increment.
export const classifyLoadGroup = (exercise: Exercise): LoadGroup => {
  if (LOWER_PATTERNS.has(exercise.pattern)) return 'lower'
  if (exercise.primaryMuscles.some((m) => LOWER_MUSCLES.has(m))) return 'lower'
  return 'upper'
}

// The working load used in a logged set group: the heaviest load across the
// working sets (double progression keeps load constant across sets).
const workingLoad = (sets: { loadKg: number }[]): number =>
  sets.reduce((max, s) => Math.max(max, s.loadKg), 0)

export const computeTarget = (
  dayExercise: DayExercise,
  sessions: SessionLog[],
): ProgressionTarget => {
  const [low, high] = dayExercise.repRange
  const exercise = getExercise(dayExercise.exerciseId)
  const group: LoadGroup = exercise ? classifyLoadGroup(exercise) : 'upper'
  const increment =
    group === 'lower'
      ? program.progression.incrementLowerKg
      : program.progression.incrementUpperKg

  const prior = getLastExerciseLog(sessions, dayExercise.exerciseId)

  // No history: rep range only, no load suggestion.
  if (!prior) {
    return {
      exerciseId: dayExercise.exerciseId,
      repRange: dayExercise.repRange,
      loadKg: null,
      repsTarget: low,
      loadIncreased: false,
      increment,
      group,
      last: null,
      lastDate: null,
    }
  }

  const { log, date } = prior
  const load = workingLoad(log.sets)
  const allSetsAtTop =
    log.sets.length > 0 && log.sets.every((s) => s.reps >= high)
  const minReps = log.sets.reduce(
    (min, s) => Math.min(min, s.reps),
    Number.POSITIVE_INFINITY,
  )

  // All sets cleared the top at a real load -> add load, reset to bottom.
  if (allSetsAtTop && load > 0) {
    return {
      exerciseId: dayExercise.exerciseId,
      repRange: dayExercise.repRange,
      loadKg: load + increment,
      repsTarget: low,
      loadIncreased: true,
      increment,
      group,
      last: log,
      lastDate: date,
    }
  }

  // Otherwise keep the load and push reps one step toward the top.
  const repsTarget = Math.min(high, Math.max(low, minReps + 1))
  return {
    exerciseId: dayExercise.exerciseId,
    repRange: dayExercise.repRange,
    loadKg: load > 0 ? load : null,
    repsTarget,
    loadIncreased: false,
    increment,
    group,
    last: log,
    lastDate: date,
  }
}
