import { liftingDays } from './program'
import { addDays, localDate } from './utils'
import type { PlannedDay, SessionLog } from './types'

// Push-forward scheduler.
//
// Nothing is tied to weekdays. Lifting days rotate Push -> Pull -> Legs with
// one rule: at least one rest day between lifting sessions. A day where a lift
// was due but nothing was logged counts as "missed" and the queue shifts
// forward — today always shows the next undone workout. Zone 2 is planned once
// per calendar week on a rest day and never blocks the lifting queue.
//
// The rotation is successor-based: the next lift is whatever follows the LAST
// COMPLETED lift in the cycle, so freely starting any workout (from the
// Workouts tab or the calendar) keeps the rotation coherent.
//
// Manual control: a stored "delay" date pushes the whole upcoming queue —
// "move to tomorrow / move to day X" simply means no lift is planned before
// that date. Everything else is derived from the session logs.

const ANCHOR_KEY = 'forma-anchor'
const DELAY_KEY = 'forma-schedule-delay'

const liftingIds = liftingDays.map((d) => d.id)

const successorOf = (dayId: string | null): string => {
  if (!dayId) return liftingIds[0]
  const idx = liftingIds.indexOf(dayId)
  return liftingIds[(idx + 1) % liftingIds.length]
}

export const getAnchor = (sessions: SessionLog[]): string => {
  const today = localDate()
  let anchor = localStorage.getItem(ANCHOR_KEY)
  if (!anchor) {
    anchor = today
    localStorage.setItem(ANCHOR_KEY, anchor)
  }
  // If history predates the anchor (e.g. restored backup), trust the history.
  const earliest = sessions.length
    ? sessions.reduce(
        (min, s) => {
          const d = localDate(new Date(s.date))
          return d < min ? d : min
        },
        localDate(new Date(sessions[0].date)),
      )
    : null
  return earliest && earliest < anchor ? earliest : anchor
}

// ----- manual postpone -----

export const getScheduleDelay = (): string | null => {
  const v = localStorage.getItem(DELAY_KEY)
  if (!v) return null
  // A delay in the past is inert.
  return v > localDate() ? v : null
}

// "No lift planned before `date`." Pass tomorrow to move today's workout.
export const setScheduleDelay = (date: string): void => {
  localStorage.setItem(DELAY_KEY, date)
}

export const clearScheduleDelay = (): void => {
  localStorage.removeItem(DELAY_KEY)
}

// Wipe every piece of local scheduling state (anchor + delay). Call this
// alongside clearing session history — otherwise the scheduler keeps walking
// forward from a stale anchor and every day since looks "missed".
export const resetScheduleState = (): void => {
  localStorage.removeItem(ANCHOR_KEY)
  localStorage.removeItem(DELAY_KEY)
}

// Monday of the week containing the given date.
const mondayOf = (dateOnly: string): string => {
  const [y, m, d] = dateOnly.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const shift = (dt.getDay() + 6) % 7 // Mon=0 … Sun=6
  return addDays(dateOnly, -shift)
}

interface Logged {
  lifting: string | null // dayId of a lifting session logged that date
  zone2: boolean
}

const indexLogs = (sessions: SessionLog[]): Map<string, Logged> => {
  const byDate = new Map<string, Logged>()
  for (const s of sessions) {
    const date = localDate(new Date(s.date))
    const entry = byDate.get(date) ?? { lifting: null, zone2: false }
    if (s.dayId === 'zone2') entry.zone2 = true
    else if (liftingIds.includes(s.dayId)) entry.lifting = s.dayId
    byDate.set(date, entry)
  }
  return byDate
}

export interface Schedule {
  days: Map<string, PlannedDay>
  today: PlannedDay
  week: PlannedDay[] // Mon–Sun of the current week
  upcoming: PlannedDay[] // next planned workouts after today (non-rest)
  // The first upcoming (or today's) planned lifting/cardio day — the queue
  // head, the only day that can be manually moved.
  nextPlanned: PlannedDay | null
}

export const deriveSchedule = (
  sessions: SessionLog[],
  todayDate: string = localDate(),
  horizonDays = 21,
): Schedule => {
  const anchor = getAnchor(sessions)
  const logs = indexLogs(sessions)
  const delay = getScheduleDelay()
  const days = new Map<string, PlannedDay>()

  // Start the walk from the Monday of the anchor week so the current week is
  // always fully covered even when the anchor is mid-week.
  const start = mondayOf(anchor < todayDate ? anchor : todayDate)
  const end = addDays(todayDate, horizonDays)

  let lastLiftId: string | null = null
  let prevWasLift = false
  let zone2DoneThisWeek = false
  let liftsThisWeek = 0

  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (date === mondayOf(date)) {
      zone2DoneThisWeek = false
      liftsThisWeek = 0
    }

    const log = logs.get(date)
    const isPast = date < todayDate
    const isToday = date === todayDate

    if (log?.lifting) {
      days.set(date, { date, dayId: log.lifting, status: 'done', isToday })
      lastLiftId = log.lifting
      prevWasLift = true
      liftsThisWeek += 1
      if (log.zone2) zone2DoneThisWeek = true
      continue
    }
    if (log?.zone2) {
      days.set(date, { date, dayId: 'zone2', status: 'done', isToday })
      zone2DoneThisWeek = true
      prevWasLift = false
      continue
    }

    if (isPast) {
      if (date < anchor || prevWasLift) {
        days.set(date, { date, dayId: null, status: 'rest', isToday })
      } else {
        // a lift was due and didn't happen -> it moved forward
        days.set(date, { date, dayId: null, status: 'missed', isToday })
      }
      prevWasLift = false
      continue
    }

    // today or future: plan forward. Lifts alternate with genuinely FREE days
    // (max 3 lifts per Mon–Sun week); Zone 2 only slots once the week's
    // lifting block is complete, so it never eats the gap between two lifts.
    const postponed = delay !== null && date < delay
    if (prevWasLift || postponed || liftsThisWeek >= 3) {
      if (liftsThisWeek >= 3 && !zone2DoneThisWeek) {
        days.set(date, { date, dayId: 'zone2', status: 'planned', isToday })
        zone2DoneThisWeek = true
      } else {
        days.set(date, { date, dayId: null, status: 'rest', isToday })
      }
      prevWasLift = false
    } else {
      const nextId = successorOf(lastLiftId)
      days.set(date, { date, dayId: nextId, status: 'planned', isToday })
      lastLiftId = nextId
      prevWasLift = true
      liftsThisWeek += 1
    }
  }

  const monday = mondayOf(todayDate)
  const week: PlannedDay[] = []
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i)
    week.push(
      days.get(date) ?? { date, dayId: null, status: 'rest', isToday: false },
    )
  }

  const today = days.get(todayDate)!
  const upcoming: PlannedDay[] = []
  for (
    let date = addDays(todayDate, 1);
    date <= end && upcoming.length < 4;
    date = addDays(date, 1)
  ) {
    const d = days.get(date)
    if (d && d.status === 'planned' && d.dayId) upcoming.push(d)
  }

  const nextPlanned =
    today.status === 'planned' && today.dayId
      ? today
      : (upcoming.find((d) => d.dayId && d.dayId !== 'zone2') ?? null)

  return { days, today, week, upcoming, nextPlanned }
}
