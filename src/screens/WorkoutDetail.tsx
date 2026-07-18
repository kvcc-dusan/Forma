import { useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, Clock, Play, Timer } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BackButton } from '@/components/back-button'
import { ExerciseGlyph } from '@/components/exercise-glyph'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { MetricPill, Tag } from '@/components/primitives'
import { WarmupCard } from '@/components/warmup-card'
import { createLiveSession, readLiveSession } from '@/lib/live-session'
import {
  estimateDayMinutes,
  estimateExerciseMinutes,
  getDay,
  getExercise,
  isLiftingDay,
  restSecondsFor,
} from '@/lib/program'
import { cn } from '@/lib/utils'

// Read-only preview of any program day, reachable from Workouts and the
// calendar. "Start this workout" works regardless of what the schedule says —
// the rotation continues from whatever actually gets done.
export function WorkoutDetail() {
  const { dayId = '' } = useParams()
  const navigate = useNavigate()
  const day = getDay(dayId)

  if (!day) {
    return (
      <AppShell hideNav>
        <div className="flex flex-col gap-4 pt-1">
          <BackButton fallback="/workouts" />
          <p className="text-muted-foreground">Workout not found.</p>
        </div>
      </AppShell>
    )
  }

  const [focus, detail] = day.name.split(' — ')
  const lifting = isLiftingDay(day)

  const start = () => {
    if (!readLiveSession()) createLiveSession(day.id)
    navigate('/train')
  }

  return (
    <AppShell hideNav>
      <div className="flex flex-col gap-6 pb-24">
        <div className="flex items-center justify-between pt-1">
          <BackButton fallback="/workouts" />
        </div>

        <div>
          {!lifting && <Tag tone="accent">Cardio</Tag>}
          <h1
            className={cn(
              'text-display text-balance font-semibold tracking-tight text-foreground',
              lifting ? 'text-[34px]' : 'mt-2.5 text-[34px]',
            )}
          >
            {focus}
          </h1>
          {detail && (
            <p className="mt-1.5 text-[14px] text-muted-foreground">{detail}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricPill
            icon={Clock}
            label="Duration"
            value={`~${estimateDayMinutes(day)} min`}
          />
          {lifting ? (
            <MetricPill
              icon={Timer}
              label="Exercises"
              value={String(day.exercises.length)}
            />
          ) : (
            <MetricPill
              icon={Timer}
              label="Intensity"
              value={`${day.targetHrPct.join('–')}% HR`}
            />
          )}
        </div>

        {lifting ? (
          <>
            <WarmupCard />
            <section className="flex flex-col gap-3">
              <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
                Exercises
              </h2>
              <div className="flex flex-col divide-y divide-border rounded-3xl bg-card">
                {day.exercises.map((dx, i) => {
                  const exercise = getExercise(dx.exerciseId)
                  if (!exercise) return null
                  return (
                    <button
                      key={dx.exerciseId}
                      type="button"
                      onClick={() => navigate(`/exercise/${exercise.id}`)}
                      className="flex items-center gap-3.5 p-4 text-left transition-colors hover:bg-secondary/40"
                    >
                      <span className="w-5 shrink-0 text-center text-[12px] font-medium tabular-nums text-muted-foreground">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <ExerciseGlyph equipment={exercise.equipment} image={exercise.image} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-semibold tracking-tight text-card-foreground">
                          {exercise.name}
                        </p>
                        <p className="mt-0.5 text-[13px] text-muted-foreground">
                          {dx.sets} × {dx.repRange[0]}–{dx.repRange[1]} · rest{' '}
                          {restSecondsFor(dx.exerciseId)}s · ~
                          {estimateExerciseMinutes(dx)} min
                        </p>
                      </div>
                      <ChevronRight
                        className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                        strokeWidth={1.6}
                      />
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        ) : (
          <>
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
              ]}
            />
          </>
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background via-background to-transparent px-4 pb-6 pt-10">
        <div className="mx-auto max-w-lg md:max-w-2xl">
          <button
            type="button"
            onClick={start}
            className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Play className="h-[18px] w-[18px] fill-current" strokeWidth={0} />
            Start this workout
          </button>
        </div>
      </div>
    </AppShell>
  )
}
