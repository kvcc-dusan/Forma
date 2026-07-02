import { liftingDays } from './program'
import { addDays, localDate } from './utils'
import type { PlannedDay, SessionLog } from './types'

// Push-forward scheduler.
//
// Nothing is tied to weekdays. The lifting cycle (Push -> Pull -> Legs) plays
// out day by day from an anchor date with one rule: at least one rest day
// between lifting sessions. A day where a lift was due but nothing was logged
// counts as "missed" and the whole queue shifts forward — today always shows
// the next undone workout. Zone 2 is planned once per calendar week on a rest
// day and never blocks the lifting queue.
//
// Everything is derived from the session logs; no calendar is stored. The only
// stored state is the anchor (first day of the program).

const ANCHOR_KEY = 'forma-anchor'

const liftingIds = liftingDays.map((d) => d.id)

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
}

export const deriveSchedule = (
  sessions: SessionLog[],
  todayDate: string = localDate(),
  horizonDays = 21,
): Schedule => {
  const anchor = getAnchor(sessions)
  const logs = indexLogs(sessions)
  const days = new Map<string, PlannedDay>()

  // Start the walk from the Monday of the anchor week so the current week is
  // always fully covered even when the anchor is mid-week.
  const start = mondayOf(anchor < todayDate ? anchor : todayDate)
  const end = addDays(todayDate, horizonDays)

  // The next lifting day is always cycle[(doneLifts + plannedLifts) % 3]:
  // completed sessions advance the cycle, and planning continues it forward.
  let plannedLiftCursor = 0
  let prevWasLift = false
  let zone2DoneThisWeek = false
  let doneLifts = 0

  for (let date = start; date <= end; date = addDays(date, 1)) {
    if (date === mondayOf(date)) zone2DoneThisWeek = false

    const log = logs.get(date)
    const isPast = date < todayDate
    const isToday = date === todayDate

    if (log?.lifting) {
      days.set(date, { date, dayId: log.lifting, status: 'done', isToday })
      doneLifts += 1
      prevWasLift = true
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
      if (date < anchor) {
        days.set(date, { date, dayId: null, status: 'rest', isToday })
      } else if (prevWasLift) {
        // mandatory rest day — nothing was due
        days.set(date, { date, dayId: null, status: 'rest', isToday })
      } else {
        // a lift was due and didn't happen -> it moved forward
        days.set(date, { date, dayId: null, status: 'missed', isToday })
      }
      prevWasLift = false
      continue
    }

    // today or future: plan forward
    if (prevWasLift) {
      // rest day; slot Zone 2 here if the week still needs it
      if (!zone2DoneThisWeek) {
        days.set(date, { date, dayId: 'zone2', status: 'planned', isToday })
        zone2DoneThisWeek = true
      } else {
        days.set(date, { date, dayId: null, status: 'rest', isToday })
      }
      prevWasLift = false
    } else {
      const nextId =
        liftingIds[(doneLifts + plannedLiftCursor) % liftingIds.length]
      days.set(date, { date, dayId: nextId, status: 'planned', isToday })
      plannedLiftCursor += 1
      prevWasLift = true
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

  return { days, today, week, upcoming }
}
