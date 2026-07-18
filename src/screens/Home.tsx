import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BedDouble,
  Check,
  Clock,
  Dumbbell,
  HeartPulse,
  Layers,
  Play,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { WeekStrip } from '@/components/week-strip'
import { DaySheet } from '@/components/day-sheet'
import { useSessions } from '@/hooks/useStore'
import { createLiveSession, readLiveSession } from '@/lib/live-session'
import { deriveSchedule } from '@/lib/schedule'
import {
  estimateDayMinutes,
  getDay,
  getExercise,
  isLiftingDay,
} from '@/lib/program'
import type { CardioDay, LiftingDay, PlannedDay } from '@/lib/types'

const headerDate = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

const shortDay = (dateOnly: string): string =>
  new Date(dateOnly + 'T12:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
  })

export function Home() {
  const { sessions, loading } = useSessions()
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState<PlannedDay | null>(null)
  // bumped after a manual move so the schedule re-derives from localStorage
  const [scheduleRev, setScheduleRev] = useState(0)

  const schedule = useMemo(
    () => (loading ? null : deriveSchedule(sessions)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessions, loading, scheduleRev],
  )

  const todayPlan = schedule?.today
  const todayDay = todayPlan?.dayId ? getDay(todayPlan.dayId) : null
  const nextUp = schedule?.upcoming[0]

  // One tap from Home into the session: create (or resume) the live session
  // for today's planned day, then jump to Train.
  const startSession = (dayId: string) => {
    if (!readLiveSession()) createLiveSession(dayId)
    navigate('/train')
  }

  const weekLiftsDone =
    schedule?.week.filter(
      (d) => d.status === 'done' && d.dayId && d.dayId !== 'zone2',
    ).length ?? 0
  const weekZone2Done =
    schedule?.week.some((d) => d.status === 'done' && d.dayId === 'zone2') ??
    false
  const trainedToday = todayPlan?.status === 'done'

  return (
    <AppShell fixed>
      <div className="shrink-0">
        <h1 className="text-display text-balance text-[32px] font-semibold tracking-tight text-foreground">
          {headerDate()}
        </h1>
        <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">
          This week · {weekLiftsDone}/3 lifts · {weekZone2Done ? '1' : '0'}/1
          cardio
        </p>
      </div>

      {loading || !schedule ? (
        <div className="flex-1 animate-pulse rounded-3xl bg-card" />
      ) : (
        <>
          {/* This week */}
          <section className="shrink-0 rounded-3xl border border-border bg-card px-4 py-5">
            <WeekStrip week={schedule.week} onDayTap={setSelectedDay} />
          </section>

          {/* Today — sized to its own content, never stretched to fill */}
          <section className="min-h-0 shrink-0 overflow-y-auto rounded-3xl border border-border bg-card p-5">
            <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
              Today
            </h2>
            <div className="mt-2 flex flex-col">
              {trainedToday ? (
                <DoneContent dayName={todayDay?.name ?? 'Session'} />
              ) : todayDay && isLiftingDay(todayDay) ? (
                <LiftingContent
                  day={todayDay}
                  onStart={() => startSession(todayDay.id)}
                />
              ) : todayDay && todayDay.type === 'cardio' ? (
                <CardioContent
                  day={todayDay}
                  onStart={() => startSession(todayDay.id)}
                />
              ) : (
                <RestContent />
              )}
            </div>
          </section>

          {/* Up next — a single compact row, anchored to the bottom */}
          {nextUp && (
            <button
              type="button"
              onClick={() => setSelectedDay(nextUp)}
              className="mt-auto flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left"
            >
              <span className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
                Up next
              </span>
              <span className="text-[12px] font-medium text-muted-foreground">
                {shortDay(nextUp.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-card-foreground">
                {nextUp.dayId ? getDay(nextUp.dayId)?.name.split(' — ')[0] : ''}
              </span>
              {nextUp.dayId === 'zone2' ? (
                <HeartPulse
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.8}
                />
              ) : (
                <Dumbbell
                  className="h-4 w-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.8}
                />
              )}
            </button>
          )}
        </>
      )}

      {selectedDay && schedule && (
        <DaySheet
          day={selectedDay}
          isQueueHead={selectedDay.date === schedule.nextPlanned?.date}
          onClose={() => setSelectedDay(null)}
          onChanged={() => setScheduleRev((r) => r + 1)}
        />
      )}
    </AppShell>
  )
}

function LiftingContent({
  day,
  onStart,
}: {
  day: LiftingDay
  onStart: () => void
}) {
  const [focus, ...rest] = day.name.split(' — ')
  const lead = day.exercises
    .slice(0, 3)
    .map((e) => getExercise(e.exerciseId)?.name)
    .filter(Boolean)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium tracking-wide text-accent ring-1 ring-inset ring-accent/25">
          {focus}
        </span>
        <h3 className="mt-3 text-[28px] font-semibold tracking-tight text-card-foreground text-display">
          {focus} day
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {rest.join(' ')}
        </p>

        <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-[15px] w-[15px]" strokeWidth={1.8} />
            {day.exercises.length} exercises
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-[15px] w-[15px]" strokeWidth={1.8} />~
            {estimateDayMinutes(day)} min
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-1">
          {lead.map((name, i) => (
            <p key={name} className="truncate text-[13px] text-muted-foreground">
              <span className="mr-2 tabular-nums text-muted-foreground/60">
                {String(i + 1).padStart(2, '0')}
              </span>
              {name}
            </p>
          ))}
          {day.exercises.length > 3 && (
            <p className="text-[13px] text-muted-foreground/60">
              + {day.exercises.length - 3} more
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
        Start workout
      </button>
    </div>
  )
}

function CardioContent({
  day,
  onStart,
}: {
  day: CardioDay
  onStart: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-w-0 flex-1">
        <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium tracking-wide text-accent ring-1 ring-inset ring-accent/25">
          Zone 2
        </span>
        <h3 className="mt-3 text-[28px] font-semibold tracking-tight text-card-foreground text-display">
          Steady cardio
        </h3>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {day.durationMin} min · conversational pace ·{' '}
          {day.targetHrPct.join('–')}% HRmax
        </p>
        <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
          {day.guidance}
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
        Start Zone 2
      </button>
    </div>
  )
}

function RestContent() {
  return (
    <div className="min-h-0 flex-1">
      <div className="flex items-center gap-2">
        <BedDouble className="h-5 w-5 text-accent" strokeWidth={1.8} />
        <h3 className="text-[28px] font-semibold tracking-tight text-card-foreground text-display">
          Rest day
        </h3>
      </div>
      <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-muted-foreground">
        Recovery is where the adaptation happens. Walk, stretch, sleep well —
        the next session is already queued.
      </p>
    </div>
  )
}

function DoneContent({ dayName }: { dayName: string }) {
  return (
    <div className="min-h-0 flex-1">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground">
        <Check className="h-5 w-5" strokeWidth={2.6} />
      </span>
      <h3 className="mt-3 text-[28px] font-semibold tracking-tight text-card-foreground text-display">
        {dayName.split(' — ')[0]} — done
      </h3>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Logged{' '}
        {new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })}
        . Nice work — the next session is already queued.
      </p>
    </div>
  )
}
