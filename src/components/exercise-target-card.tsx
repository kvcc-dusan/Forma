import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  Check,
  ChevronRight,
  Repeat2,
  Timer,
} from 'lucide-react'
import type { Exercise, ProgressionTarget } from '@/lib/types'
import { resolveSubstitutions } from '@/lib/program'
import { cn, formatLoad } from '@/lib/utils'
import { ExerciseGlyph } from './exercise-glyph'

// One exercise on the Today screen: target sets × reps, computed progression
// load, last-session recall, a substitute affordance, and (when it's the
// current exercise) a rest-timer trigger. Reading-first, minimal taps.

function lastSummary(target: ProgressionTarget): string | null {
  if (!target.last) return null
  const sets = target.last.sets
  const load = sets.reduce((m, s) => Math.max(m, s.loadKg), 0)
  const reps = sets.map((s) => s.reps).join('/')
  return `${reps}${load > 0 ? ` @ ${formatLoad(load)}` : ''}`
}

export function ExerciseTargetCard({
  exercise,
  prescription,
  target,
  current,
  done,
  onMarkDone,
  onRest,
  onSubstitute,
  originalName,
}: {
  exercise: Exercise
  prescription: { sets: number; repRange: [number, number] }
  target: ProgressionTarget
  current: boolean
  done: boolean
  onMarkDone: () => void
  onRest: () => void
  onSubstitute: (substituteId: string | null) => void
  originalName?: string
}) {
  const navigate = useNavigate()
  const [picking, setPicking] = useState(false)
  const subs = resolveSubstitutions(exercise.substitutions)
  const [low, high] = prescription.repRange
  const last = lastSummary(target)

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border bg-card transition-colors',
        current ? 'border-foreground/25' : 'border-border',
        done && 'opacity-60',
      )}
    >
      <div className="flex items-stretch gap-3 p-3">
        <button
          type="button"
          onClick={() => navigate(`/exercise/${exercise.id}`)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <ExerciseGlyph equipment={exercise.equipment} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-card-foreground">
                {exercise.name}
              </h3>
              {done && (
                <Check className="h-4 w-4 shrink-0 text-accent" strokeWidth={2.4} />
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {prescription.sets} sets · {low}–{high} reps
            </p>
            {originalName && (
              <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                swapped from {originalName}
              </p>
            )}
          </div>
          <ChevronRight
            className="h-[18px] w-[18px] shrink-0 self-center text-muted-foreground"
            strokeWidth={1.6}
          />
        </button>
      </div>

      {/* target block */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-label text-muted-foreground">
              Today's target
            </p>
            <p className="mt-1 text-[17px] font-semibold tracking-tight text-card-foreground tabular-nums">
              {prescription.sets} × {target.repsTarget}
              {target.loadKg !== null ? (
                <span className="text-muted-foreground">
                  {' '}
                  @ {formatLoad(target.loadKg)}
                </span>
              ) : (
                <span className="ml-1 text-[13px] font-normal text-muted-foreground">
                  set load at RIR 2
                </span>
              )}
            </p>
          </div>
          {target.loadIncreased && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent ring-1 ring-inset ring-accent/25">
              <ArrowUp className="h-3 w-3" strokeWidth={2.4} />+
              {target.increment}kg
            </span>
          )}
        </div>

        {last && (
          <p className="mt-2 text-[12px] text-muted-foreground">
            <span className="text-muted-foreground/70">Last:</span> {last}
          </p>
        )}

        {/* action row */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            <Repeat2 className="h-3.5 w-3.5" /> Substitute
          </button>
          {current && (
            <>
              <button
                type="button"
                onClick={onRest}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
              >
                <Timer className="h-3.5 w-3.5" /> Rest
              </button>
              <button
                type="button"
                onClick={onMarkDone}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-semibold text-background"
              >
                <Check className="h-3.5 w-3.5" /> Done
              </button>
            </>
          )}
        </div>

        {picking && (
          <div className="mt-3 flex flex-col gap-1.5 rounded-2xl border border-border bg-background p-2">
            {originalName && (
              <button
                type="button"
                onClick={() => {
                  onSubstitute(null)
                  setPicking(false)
                }}
                className="rounded-xl px-3 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-secondary"
              >
                ↩ Revert to {originalName}
              </button>
            )}
            {subs.length === 0 && (
              <p className="px-3 py-2 text-[13px] text-muted-foreground">
                No catalogued substitutions.
              </p>
            )}
            {subs.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  onSubstitute(s.id)
                  setPicking(false)
                }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary"
              >
                <ExerciseGlyph equipment={s.equipment} size="sm" />
                <span className="text-[14px] font-medium text-foreground">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
