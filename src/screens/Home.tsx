import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BedDouble,
  Check,
  Clock,
  Dumbbell,
  HeartPulse,
  Layers,
  Play,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { SectionHeader, Tag } from '@/components/primitives'
import { ThemeToggle } from '@/components/theme-toggle'
import { WeekStrip } from '@/components/week-strip'
import { useSessions } from '@/hooks/useStore'
import { createLiveSession, readLiveSession } from '@/lib/live-session'
import { deriveSchedule } from '@/lib/schedule'
import { getDay, getExercise, isLiftingDay } from '@/lib/program'
import type { CardioDay, LiftingDay } from '@/lib/types'

const headerDate = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

// Rough session length: warm-up + sets * (work + rest) + cool-down.
const estimateMinutes = (day: LiftingDay): number => {
  const sets = day.exercises.reduce((n, e) => n + e.sets, 0)
  return Math.round(5 + sets * 2.5 + 4)
}

export function Home() {
  const { sessions, loading } = useSessions()
  const navigate = useNavigate()

  const schedule = useMemo(
    () => (loading ? null : deriveSchedule(sessions)),
    [sessions, loading],
  )

  const todayPlan = schedule?.today
  const todayDay = todayPlan?.dayId ? getDay(todayPlan.dayId) : null

  // One tap from Home into the session: create (or resume) the live session
  // for today's planned day, then jump to Train.
  const startSession = (dayId: string) => {
    if (!readLiveSession()) createLiveSession(dayId, sessions)
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
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={headerDate()}
          title="Home"
          actions={<ThemeToggle />}
        />

        {loading || !schedule ? (
          <div className="h-64 animate-pulse rounded-3xl bg-card" />
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <SectionHeader
                title="This week"
                action={
                  <span className="text-[12px] font-medium text-muted-foreground">
                    {weekLiftsDone}/3 lifts · {weekZone2Done ? '1' : '0'}/1
                    cardio
                  </span>
                }
              />
              <WeekStrip week={schedule.week} />
            </section>

            <section className="flex flex-col gap-3">
              <SectionHeader title="Today" />
              {trainedToday ? (
                <DoneCard dayName={todayDay?.name ?? 'Session'} />
              ) : todayDay && isLiftingDay(todayDay) ? (
                <LiftingCard
                  day={todayDay}
                  onStart={() => startSession(todayDay.id)}
                />
              ) : todayDay && todayDay.type === 'cardio' ? (
                <CardioCard
                  day={todayDay}
                  onStart={() => startSession(todayDay.id)}
                />
              ) : (
                <RestCard />
              )}
            </section>

            {schedule.upcoming.length > 0 && (
              <section className="flex flex-col gap-3">
                <SectionHeader title="Up next" />
                <div className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-card">
                  {schedule.upcoming.map((d) => {
                    const day = d.dayId ? getDay(d.dayId) : null
                    if (!day) return null
                    return (
                      <div
                        key={d.date}
                        className="flex items-center gap-3.5 p-4"
                      >
                        <span className="w-14 shrink-0 text-[12px] font-medium text-muted-foreground">
                          {new Date(d.date + 'T12:00').toLocaleDateString(
                            'en-GB',
                            { weekday: 'short', day: 'numeric' },
                          )}
                        </span>
                        <span className="flex-1 truncate text-[14px] font-medium text-card-foreground">
                          {day.name}
                        </span>
                        {day.type === 'cardio' ? (
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
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

function LiftingCard({
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
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="p-5">
        <Tag tone="accent">{focus}</Tag>
        <h3 className="mt-3 text-[26px] font-semibold tracking-tight text-card-foreground text-display">
          {focus} day
        </h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {rest.join(' ')}
        </p>

        <div className="mt-4 flex items-center gap-4 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-[15px] w-[15px]" strokeWidth={1.8} />
            {day.exercises.length} exercises
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-[15px] w-[15px]" strokeWidth={1.8} />~
            {estimateMinutes(day)} min
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {lead.map((name, i) => (
            <p key={name} className="text-[13px] text-muted-foreground">
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
        className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
        Start workout
      </button>
    </div>
  )
}

function CardioCard({
  day,
  onStart,
}: {
  day: CardioDay
  onStart: () => void
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="p-5">
        <Tag tone="accent">Zone 2</Tag>
        <h3 className="mt-3 text-[26px] font-semibold tracking-tight text-card-foreground text-display">
          Steady cardio
        </h3>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
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
        className="flex w-full items-center justify-center gap-2 bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
        Start Zone 2
      </button>
    </div>
  )
}

function RestCard() {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <BedDouble className="h-[18px] w-[18px] text-accent" strokeWidth={1.8} />
        <h3 className="text-[17px] font-semibold tracking-tight text-card-foreground">
          Rest day
        </h3>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Recovery is where the adaptation happens. Walk, stretch, sleep well —
        the next session is already queued.
      </p>
    </div>
  )
}

function DoneCard({ dayName }: { dayName: string }) {
  return (
    <div className="rounded-3xl border border-accent/40 bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Check className="h-4 w-4" strokeWidth={2.6} />
        </span>
        <div>
          <h3 className="text-[16px] font-semibold tracking-tight text-card-foreground">
            {dayName} — done
          </h3>
          <p className="text-[13px] text-muted-foreground">
            Logged {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            . Nice work.
          </p>
        </div>
      </div>
      <Link
        to="/progress"
        className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent"
      >
        See progress
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
