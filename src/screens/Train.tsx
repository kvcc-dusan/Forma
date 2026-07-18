import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Flag, Play, X } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Tag } from '@/components/primitives'
import { WarmupCard, CooldownCard } from '@/components/warmup-card'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { LiveExerciseCard } from '@/components/live-exercise-card'
import { FinishSurvey, type SurveyResult } from '@/components/finish-survey'
import { RestTimer } from '@/components/rest-timer'
import { useSessions } from '@/hooks/useStore'
import { deriveSchedule } from '@/lib/schedule'
import { getDay, restSecondsFor } from '@/lib/program'
import {
  clearLiveSession,
  createLiveSession,
  readLiveSession,
  substituteInLiveSession,
  writeLiveSession,
  type LiveSession,
} from '@/lib/live-session'
import { addSession, uuid } from '@/lib/db'
import { todayISO } from '@/lib/utils'
import type { CardioDay, SessionLog } from '@/lib/types'

const elapsedMinutes = (startedAt: string): number =>
  Math.max(1, Math.round((Date.now() - new Date(startedAt).getTime()) / 60000))

export function Train() {
  const { sessions, loading, reload } = useSessions()
  const navigate = useNavigate()

  const [live, setLive] = useState<LiveSession | null>(() => readLiveSession())
  const [timer, setTimer] = useState<number | null>(null)
  const [isFinishing, setFinishing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)

  const schedule = useMemo(
    () => (loading ? null : deriveSchedule(sessions)),
    [sessions, loading],
  )

  // ---------- no active session: offer to start ----------
  if (!live) {
    const todayPlan = schedule?.today
    const plannedId = todayPlan?.status === 'planned' ? todayPlan.dayId : null
    // Even on a rest day the next queued workout can be pulled forward.
    const nextId = plannedId ?? schedule?.upcoming[0]?.dayId ?? null
    const nextDay = nextId ? getDay(nextId) : null

    return (
      <AppShell>
        <div className="flex flex-col gap-6">
          <PageHeader eyebrow="Training" title="Train" />
          {loading ? (
            <div className="h-40 animate-pulse rounded-3xl bg-card" />
          ) : todayPlan?.status === 'done' ? (
            <div className="rounded-3xl bg-card p-5">
              <p className="text-[15px] font-medium text-card-foreground">
                Today's session is already logged. ✓
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Rest up — the next workout is queued.
              </p>
            </div>
          ) : nextDay ? (
            <div className="rounded-3xl bg-card p-5">
              <Tag tone="accent">
                {todayPlan?.status === 'planned' ? 'Planned today' : 'Next up'}
              </Tag>
              <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-card-foreground text-display">
                {nextDay.name}
              </h2>
              {todayPlan?.status !== 'planned' && (
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                  Today is a rest day, but the queue is flexible — starting now
                  simply pulls the schedule forward.
                </p>
              )}
              <button
                type="button"
                onClick={() => setLive(createLiveSession(nextDay.id))}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
                Start {nextDay.type === 'cardio' ? 'Zone 2' : 'workout'}
              </button>
            </div>
          ) : (
            <p className="text-muted-foreground">No workout available.</p>
          )}
        </div>
      </AppShell>
    )
  }

  // ---------- active session ----------
  const day = getDay(live.dayId)
  const isCardio = day?.type === 'cardio'
  const doneCount = live.exercises.filter((e) => e.done).length
  const total = live.exercises.length
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100)

  const update = (mutate: (s: LiveSession) => LiveSession) => {
    setLive((prev) => {
      if (!prev) return prev
      const next = mutate(prev)
      writeLiveSession(next)
      return next
    })
  }

  const handleDone = (exIdx: number) => {
    const wasDone = live.exercises[exIdx].done
    update((s) => {
      const exercises = s.exercises.map((ex, i) =>
        i === exIdx ? { ...ex, done: !ex.done } : ex,
      )
      // move focus to the next unfinished exercise
      let currentIndex = s.currentIndex
      if (!wasDone) {
        const next = exercises.findIndex((ex, i) => i > exIdx && !ex.done)
        currentIndex = next !== -1 ? next : -1
      }
      return { ...s, exercises, currentIndex }
    })
    if (!wasDone) setTimer(restSecondsFor(live.exercises[exIdx].exerciseId))
  }

  const handleSubstitute = (originalId: string, substituteId: string) => {
    setLive((prev) =>
      prev ? substituteInLiveSession(prev, originalId, substituteId) : prev,
    )
  }

  const saveSession = async (survey: SurveyResult) => {
    setSaving(true)
    const log: SessionLog = {
      id: uuid(),
      dayId: live.dayId,
      date: todayISO(),
      perExercise: live.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        completed: ex.done,
        sets: [],
      })),
      ...survey,
    }
    await addSession(log)
    clearLiveSession()
    await reload()
    setSaving(false)
    navigate('/')
  }

  const discard = () => {
    clearLiveSession()
    setLive(null)
    setConfirmExit(false)
  }

  return (
    <AppShell hideNav>
      {/* session header */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex items-center justify-between py-3">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            aria-label="Exit session"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-label text-muted-foreground">
              In session
            </p>
            <p className="text-sm font-semibold text-foreground">
              {day?.name.split(' — ')[0]}
            </p>
          </div>
          <SessionClock startedAt={live.startedAt} />
        </div>
        {!isCardio && (
          <div className="-mx-4 h-0.5 bg-muted md:-mx-8">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 pt-5">
        {isCardio && day ? (
          <CardioSession day={day as CardioDay} />
        ) : (
          <>
            <div className="flex items-baseline justify-between px-1">
              <p className="text-4xl font-semibold tracking-tight text-foreground tabular-nums">
                {doneCount}
                <span className="text-xl text-muted-foreground">/{total}</span>
              </p>
              <span className="text-[11px] uppercase tracking-label text-muted-foreground">
                exercises
              </span>
            </div>

            {!live.warmupDone && (
              <div className="relative">
                <WarmupCard />
                <button
                  type="button"
                  onClick={() => update((s) => ({ ...s, warmupDone: true }))}
                  className="absolute right-3.5 top-3.5 flex items-center gap-1.5 rounded-full bg-secondary px-3.5 py-2 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
                >
                  <Check className="h-3.5 w-3.5" /> Done
                </button>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {live.exercises.map((entry, i) => (
                <LiveExerciseCard
                  key={entry.originalId}
                  entry={entry}
                  index={i}
                  isExpanded={live.currentIndex === i}
                  onFocus={() =>
                    update((s) => ({
                      ...s,
                      currentIndex: s.currentIndex === i ? -1 : i,
                    }))
                  }
                  onDone={() => handleDone(i)}
                  onSubstitute={(subId) =>
                    handleSubstitute(entry.originalId, subId)
                  }
                />
              ))}
            </div>

            <CooldownCard />
          </>
        )}

        <button
          type="button"
          onClick={() => setFinishing(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-[15px] font-semibold text-background transition-opacity hover:opacity-90"
        >
          <Flag className="h-[18px] w-[18px]" strokeWidth={2} />
          Finish {isCardio ? 'Zone 2' : 'workout'}
        </button>
      </div>

      {timer !== null && (
        <RestTimer duration={timer} onClose={() => setTimer(null)} />
      )}

      {isFinishing && (
        <FinishSurvey
          durationMin={elapsedMinutes(live.startedAt)}
          saving={isSaving}
          onSubmit={saveSession}
          onCancel={() => setFinishing(false)}
        />
      )}

      {confirmExit && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6">
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setConfirmExit(false)}
            className="fixed inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-card p-5">
            <h3 className="text-[17px] font-semibold tracking-tight text-card-foreground">
              Leave this session?
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Your progress stays saved on this device — come back and
              continue, or discard the session entirely.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmExit(false)
                  navigate('/')
                }}
                className="rounded-xl bg-secondary py-3 text-[14px] font-semibold text-secondary-foreground"
              >
                Keep session, go Home
              </button>
              <button
                type="button"
                onClick={discard}
                className="rounded-xl bg-destructive/15 py-3 text-[14px] font-semibold text-destructive"
              >
                Discard session
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}

function SessionClock({ startedAt }: { startedAt: string }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000)
    return () => window.clearInterval(id)
  }, [])
  return (
    <span className="w-10 text-right text-[13px] font-medium tabular-nums text-muted-foreground">
      {elapsedMinutes(startedAt)}′
    </span>
  )
}

function CardioSession({ day }: { day: CardioDay }) {
  return (
    <>
      <div className="rounded-3xl bg-card p-5 text-center">
        <p className="text-[11px] uppercase tracking-label text-muted-foreground">
          Target
        </p>
        <p className="mt-2 text-5xl font-semibold tracking-tight text-card-foreground tabular-nums">
          {day.durationMin}
          <span className="text-xl text-muted-foreground"> min</span>
        </p>
        <p className="mt-2 text-[13px] text-muted-foreground">
          {day.targetHrPct.join('–')}% HRmax · conversational pace
        </p>
      </div>

      <div className="rounded-3xl bg-card p-5">
        <p className="text-pretty text-[15px] leading-relaxed text-card-foreground">
          {day.guidance}
        </p>
      </div>

      <HeartSafeBlock
        title="Keep it steady"
        notes={[
          'Steady-state only — no intervals, no surges, no sprints.',
          'Trust breathing and the talk test over wrist HR.',
          'Dizziness, chest discomfort, or frequent palpitations: stop.',
        ]}
      />
    </>
  )
}
