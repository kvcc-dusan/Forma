import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Dumbbell, Repeat2, Target } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BackButton } from '@/components/back-button'
import { ExerciseGlyph } from '@/components/exercise-glyph'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { MetricPill, Tag } from '@/components/primitives'
import { getExercise, resolveSubstitutions } from '@/lib/program'
import { nextLiftingDay } from '@/lib/rotation'
import { getSubs, setSub } from '@/lib/session-draft'
import { useSessions } from '@/hooks/useStore'
import type { LiftingDay } from '@/lib/types'

// Find which prescribed slot (by original exerciseId) currently resolves to the
// given exercise on today's day, so a swap can target the right slot.
const findSlot = (
  day: LiftingDay,
  subs: Record<string, string>,
  exerciseId: string,
): string | null => {
  for (const dx of day.exercises) {
    const effective = subs[dx.exerciseId] ?? dx.exerciseId
    if (effective === exerciseId) return dx.exerciseId
  }
  return null
}

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

export function ExerciseDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { sessions } = useSessions()
  const exercise = getExercise(id)

  const day = useMemo(() => nextLiftingDay(sessions), [sessions])
  const subs = getSubs(day.id)
  const slot = exercise ? findSlot(day, subs, exercise.id) : null
  const subOptions = exercise ? resolveSubstitutions(exercise.substitutions) : []

  if (!exercise) {
    return (
      <AppShell hideTabBar>
        <div className="flex flex-col gap-4 px-5 pt-3">
          <BackButton />
          <p className="text-muted-foreground">Exercise not found.</p>
        </div>
      </AppShell>
    )
  }

  const swap = (substituteId: string) => {
    if (!slot) return
    setSub(day.id, slot, substituteId === slot ? null : substituteId)
    navigate('/')
  }

  return (
    <AppShell hideTabBar>
      <div className="relative">
        <div className="flex h-44 items-center justify-center bg-gradient-to-br from-secondary to-card">
          <ExerciseGlyph
            equipment={exercise.equipment}
            size="lg"
            className="h-24 w-24 rounded-3xl"
          />
        </div>
        <div className="absolute inset-x-0 top-0 px-5 pt-3">
          <BackButton variant="overlay" />
        </div>
      </div>

      <div className="flex flex-col gap-7 px-5 pb-16 pt-5">
        <div>
          <Tag tone="accent" className="capitalize">
            {titleCase(exercise.pattern)}
          </Tag>
          <h1 className="text-display mt-2 text-balance text-[30px] font-semibold tracking-tight text-foreground">
            {exercise.name}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <MetricPill
            icon={Target}
            label="Primary"
            value={exercise.primaryMuscles.map(titleCase).join(', ')}
          />
          <MetricPill
            icon={Dumbbell}
            label="Kit"
            value={titleCase(exercise.equipment)}
          />
          <MetricPill icon={Repeat2} label="Skill" value={titleCase(exercise.skill)} />
        </div>

        {/* Heart-safe: distinct, always-visible safety block */}
        <HeartSafeBlock notes={exercise.heartSafe} />

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            Coaching cues
          </h2>
          <ol className="flex flex-col gap-3">
            {exercise.cues.map((cue, i) => (
              <li key={cue} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-medium text-secondary-foreground tabular-nums">
                  {i + 1}
                </span>
                <p className="text-[14px] leading-relaxed text-foreground">
                  {cue}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            Targets
          </h2>
          <div className="flex flex-wrap gap-2">
            {exercise.primaryMuscles.map((m) => (
              <Tag key={m}>{titleCase(m)}</Tag>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            Substitutions
          </h2>
          {!slot && (
            <p className="text-[13px] text-muted-foreground">
              Swapping is available from today's session.
            </p>
          )}
          <div className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-card">
            {subOptions.length === 0 && (
              <p className="p-4 text-[13px] text-muted-foreground">
                No catalogued substitutions for this movement.
              </p>
            )}
            {subOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={!slot}
                onClick={() => swap(s.id)}
                className="flex items-center gap-3.5 p-3 text-left transition-colors enabled:hover:bg-secondary/40 disabled:opacity-60"
              >
                <ExerciseGlyph equipment={s.equipment} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium tracking-tight text-card-foreground">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {s.primaryMuscles.map(titleCase).join(' · ')}
                  </p>
                </div>
                {slot && (
                  <span className="text-[12px] font-medium text-accent">
                    Swap →
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
