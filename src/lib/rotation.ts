import { liftingDays } from './program'
import type { LiftingDay, SessionLog } from './types'

// The lifting rotation is A -> B -> C, derived from the program's lifting days
// in order. Zone 2 is selectable separately and never advances this counter.

const rotationIds = liftingDays.map((d) => d.id)

// Determine the next lifting day given session history (newest-first).
// Defaults to the first lifting day when there is no completed lifting history.
export const nextLiftingDay = (sessions: SessionLog[]): LiftingDay => {
  const lastLift = sessions.find((s) => rotationIds.includes(s.dayId))

  if (!lastLift) return liftingDays[0]

  const idx = rotationIds.indexOf(lastLift.dayId)
  const nextIdx = (idx + 1) % rotationIds.length
  return liftingDays[nextIdx]
}

// Position label like "B · 2 of 3" for UI context.
export const rotationLabel = (day: LiftingDay): string => {
  const idx = rotationIds.indexOf(day.id)
  return `${day.id} · ${idx + 1} of ${rotationIds.length}`
}
