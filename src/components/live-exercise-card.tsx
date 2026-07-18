import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Clock, Repeat2, Timer } from 'lucide-react'
import {
  estimateExerciseMinutes,
  getExercise,
  resolveSubstitutions,
  restSecondsFor,
} from '@/lib/program'
import type { LiveExercise } from '@/lib/live-session'
import { cn } from '@/lib/utils'
import { ExerciseGlyph, ExerciseMedia } from './exercise-glyph'

// One exercise inside the live session, read-first: the prescription is the
// content, the only interaction is one big "done" check (plus optional
// substitute / cues). No number inputs anywhere.

type Props = {
  entry: LiveExercise
  index: number
  isExpanded: boolean
  onFocus: () => void
  onDone: () => void
  onSubstitute: (substituteId: string) => void
}

export function LiveExerciseCard({
  entry,
  index,
  isExpanded,
  onFocus,
  onDone,
  onSubstitute,
}: Props) {
  const [isPicking, setPicking] = useState(false)
  const exercise = getExercise(entry.exerciseId)
  if (!exercise) return null

  const subs = resolveSubstitutions(exercise.substitutions)
  const isSwapped = entry.exerciseId !== entry.originalId
  const [low, high] = entry.repRange
  const rest = restSecondsFor(entry.exerciseId)
  const minutes = estimateExerciseMinutes({
    exerciseId: entry.exerciseId,
    sets: entry.sets,
    repRange: entry.repRange,
  })

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl transition-colors',
        entry.done ? 'bg-success/10' : 'bg-card',
      )}
    >
      <button
        type="button"
        onClick={onFocus}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="w-6 shrink-0 text-center text-[13px] font-medium tabular-nums text-muted-foreground">
          {entry.done ? (
            <Check className="mx-auto h-4 w-4 text-success" strokeWidth={2.6} />
          ) : (
            String(index + 1).padStart(2, '0')
          )}
        </span>
        <ExerciseGlyph equipment={exercise.equipment} image={exercise.image} size="sm" />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate text-[16px] font-semibold tracking-tight',
              entry.done ? 'text-muted-foreground' : 'text-card-foreground',
            )}
          >
            {exercise.name}
          </p>
          <p className="mt-0.5 text-[13px] font-medium text-muted-foreground tabular-nums">
            {entry.sets} × {low}–{high}
            {isSwapped && ' · swapped'}
          </p>
        </div>
        {!isExpanded && (
          <ChevronRight
            className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
            strokeWidth={1.6}
          />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border px-4 pb-4 pt-4">
          <ExerciseMedia
            equipment={exercise.equipment}
            image={exercise.image}
            className="mb-4 aspect-[16/9]"
          />
          {/* the prescription, big and readable */}
          <div className="flex items-end justify-between">
            <p className="text-[28px] font-semibold tracking-tight text-card-foreground tabular-nums text-display">
              {entry.sets} × {low}–{high}
              <span className="ml-2 text-[14px] font-normal text-muted-foreground">
                reps
              </span>
            </p>
            <Link
              to={`/exercise/${exercise.id}`}
              className="pb-1 text-[13px] font-medium text-accent"
            >
              Cues →
            </Link>
          </div>

          <div className="mt-2.5 flex items-center gap-4 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Timer className="h-[15px] w-[15px]" strokeWidth={1.8} />
              rest {rest}s
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-[15px] w-[15px]" strokeWidth={1.8} />~
              {minutes} min
            </span>
          </div>

          <p className="mt-2.5 text-[13px] leading-relaxed text-safe">
            {exercise.heartSafe[0]}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPicking((p) => !p)}
              className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-secondary px-4 text-[13px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
            >
              <Repeat2 className="h-4 w-4" />
              Substitute
            </button>
            <button
              type="button"
              onClick={onDone}
              className={cn(
                'ml-auto flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors',
                entry.done
                  ? 'bg-success/15 text-success'
                  : 'bg-foreground text-background',
              )}
            >
              <Check className="h-4 w-4" strokeWidth={2.6} />
              {entry.done ? 'Done' : 'Mark done'}
            </button>
          </div>

          {isPicking && (
            <div className="mt-3 flex flex-col gap-1 rounded-2xl bg-background p-2">
              {isSwapped && (
                <SubOption
                  id={entry.originalId}
                  label={`↩ Back to ${getExercise(entry.originalId)?.name ?? entry.originalId}`}
                  onPick={(id) => {
                    onSubstitute(id)
                    setPicking(false)
                  }}
                />
              )}
              {subs
                .filter((s) => s.id !== entry.exerciseId)
                .map((s) => (
                  <SubOption
                    key={s.id}
                    id={s.id}
                    label={s.name}
                    onPick={(id) => {
                      onSubstitute(id)
                      setPicking(false)
                    }}
                  />
                ))}
              {subs.length === 0 && !isSwapped && (
                <p className="px-3 py-2 text-[13px] text-muted-foreground">
                  No catalogued substitutions.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SubOption({
  id,
  label,
  onPick,
}: {
  id: string
  label: string
  onPick: (id: string) => void
}) {
  const exercise = getExercise(id)
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-secondary"
    >
      {exercise && <ExerciseGlyph equipment={exercise.equipment} image={exercise.image} size="sm" />}
      <span className="text-[14px] font-medium text-foreground">{label}</span>
    </button>
  )
}
