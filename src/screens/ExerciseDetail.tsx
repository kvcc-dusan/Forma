import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Dumbbell, Repeat2, Target } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BackButton } from '@/components/back-button'
import { ExerciseGlyph, ExerciseMedia } from '@/components/exercise-glyph'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { Tag } from '@/components/primitives'
import { getExercise, resolveSubstitutions } from '@/lib/program'
import {
  readLiveSession,
  substituteInLiveSession,
} from '@/lib/live-session'

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ')

// First muscle + a "+N" overflow badge — a value that's always short, so the
// spec card row height never depends on how many muscles a movement targets.
const muscleSummary = (muscles: string[]): string => {
  if (muscles.length === 0) return '—'
  const [first, ...rest] = muscles
  return rest.length > 0 ? `${titleCase(first)} +${rest.length}` : titleCase(first)
}

export function ExerciseDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const exercise = getExercise(id)

  // Swapping is only meaningful inside an active session: find the live slot
  // this exercise currently occupies (if any).
  const [live] = useState(() => readLiveSession())
  const liveSlot = live?.exercises.find((e) => e.exerciseId === id) ?? null
  const subOptions = exercise
    ? resolveSubstitutions(exercise.substitutions)
    : []

  if (!exercise) {
    return (
      <AppShell hideNav>
        <div className="flex flex-col gap-4 pt-1">
          <BackButton />
          <p className="text-muted-foreground">Exercise not found.</p>
        </div>
      </AppShell>
    )
  }

  const swap = (substituteId: string) => {
    if (!live || !liveSlot) return
    substituteInLiveSession(live, liveSlot.originalId, substituteId)
    navigate('/train')
  }

  return (
    <AppShell hideNav>
      <div className="flex flex-col gap-7">
        <div className="pt-1">
          <BackButton />
        </div>

        <ExerciseMedia equipment={exercise.equipment} image={exercise.image} />

        <div>
          <Tag tone="accent">{titleCase(exercise.pattern)}</Tag>
          <h1 className="text-display mt-2.5 text-balance text-[30px] font-semibold tracking-tight text-foreground">
            {exercise.name}
          </h1>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-card">
          <SpecRow
            icon={Target}
            label="Primary"
            value={muscleSummary(exercise.primaryMuscles)}
          />
          <SpecRow icon={Dumbbell} label="Kit" value={titleCase(exercise.equipment)} />
          <SpecRow icon={Repeat2} label="Skill" value={titleCase(exercise.skill)} />
        </div>

        {/* Heart-safe: distinct, always-visible safety block */}
        <HeartSafeBlock notes={exercise.heartSafe} />

        <section className="flex flex-col gap-3">
          <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            Coaching cues
          </h2>
          <ol className="flex flex-col gap-3">
            {exercise.cues.map((cue, i) => (
              <li key={cue} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[12px] font-medium text-secondary-foreground tabular-nums">
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
            Substitutions
          </h2>
          {!liveSlot && subOptions.length > 0 && (
            <p className="text-[13px] text-muted-foreground">
              Swapping applies during an active session.
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
                disabled={!liveSlot}
                onClick={() => swap(s.id)}
                className="flex items-center gap-3.5 p-4 text-left transition-colors enabled:hover:bg-secondary/40 disabled:cursor-default"
              >
                <ExerciseGlyph equipment={s.equipment} image={s.image} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium tracking-tight text-card-foreground">
                    {s.name}
                  </p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {s.primaryMuscles.map(titleCase).join(' · ')}
                  </p>
                </div>
                {liveSlot && (
                  <span className="shrink-0 text-[12px] font-medium text-accent">
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

function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5">
      <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
        {label}
      </span>
      <span className="truncate text-[14px] font-semibold text-card-foreground">
        {value}
      </span>
    </div>
  )
}
