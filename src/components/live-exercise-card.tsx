import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Repeat2 } from 'lucide-react'
import { getExercise, resolveSubstitutions } from '@/lib/program'
import { getLastExerciseLog } from '@/lib/db'
import type { LiveExercise } from '@/lib/live-session'
import type { SessionLog } from '@/lib/types'
import { cn, formatLoad } from '@/lib/utils'
import { ExerciseGlyph } from './exercise-glyph'

// One exercise inside the live session. Collapsed: name + progress. Expanded
// (current): editable set rows with a big done-toggle per set, last-session
// recall, heart-safe one-liner, substitute picker.

export function LiveExerciseCard({
  entry,
  index,
  expanded,
  sessions,
  onFocus,
  onSetChange,
  onSetDone,
  onSubstitute,
}: {
  entry: LiveExercise
  index: number
  expanded: boolean
  sessions: SessionLog[]
  onFocus: () => void
  onSetChange: (setIdx: number, field: 'reps' | 'loadKg', value: number) => void
  onSetDone: (setIdx: number) => void
  onSubstitute: (substituteId: string) => void
}) {
  const [picking, setPicking] = useState(false)
  const exercise = getExercise(entry.exerciseId)
  if (!exercise) return null

  const doneCount = entry.sets.filter((s) => s.done).length
  const allDone = doneCount === entry.sets.length
  const last = getLastExerciseLog(sessions, entry.exerciseId)
  const lastSummary = last
    ? `${last.log.sets.map((s) => s.reps).join('/')} @ ${formatLoad(
        last.log.sets.reduce((m, s) => Math.max(m, s.loadKg), 0),
      )}`
    : null
  const subs = resolveSubstitutions(exercise.substitutions)
  const swapped = entry.exerciseId !== entry.originalId
  const [low, high] = entry.repRange

  return (
    <div
      className={cn(
        'overflow-hidden rounded-3xl border bg-card transition-colors',
        allDone
          ? 'border-accent/40'
          : expanded
            ? 'border-foreground/25'
            : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={onFocus}
        className="flex w-full items-center gap-3 p-3.5 text-left"
      >
        <span className="w-6 shrink-0 text-center text-[12px] font-medium tabular-nums text-muted-foreground">
          {allDone ? (
            <Check className="mx-auto h-4 w-4 text-accent" strokeWidth={2.6} />
          ) : (
            String(index + 1).padStart(2, '0')
          )}
        </span>
        <ExerciseGlyph equipment={exercise.equipment} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight text-card-foreground">
            {exercise.name}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {doneCount}/{entry.sets.length} sets · {low}–{high} reps
            {swapped && ' · swapped'}
          </p>
        </div>
        {!expanded && (
          <ChevronRight
            className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
            strokeWidth={1.6}
          />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border px-3.5 pb-3.5 pt-1">
          <div className="flex items-baseline justify-between pt-2">
            {lastSummary ? (
              <p className="text-[12px] text-muted-foreground">
                <span className="text-muted-foreground/70">Last:</span>{' '}
                {lastSummary}
              </p>
            ) : (
              <p className="text-[12px] text-muted-foreground">
                First time — set the load at RIR 2
              </p>
            )}
            <Link
              to={`/exercise/${exercise.id}`}
              className="text-[12px] font-medium text-accent"
            >
              Cues →
            </Link>
          </div>

          <p className="mt-1.5 text-[12px] leading-relaxed text-safe">
            {exercise.heartSafe[0]}
          </p>

          <div className="mt-3 grid grid-cols-[24px_1fr_1fr_52px] items-center gap-2 px-1 pb-1.5 text-[10px] uppercase tracking-label text-muted-foreground">
            <span>Set</span>
            <span>Reps</span>
            <span>Kg</span>
            <span className="text-right">Done</span>
          </div>
          <div className="space-y-1.5">
            {entry.sets.map((s, setIdx) => (
              <div
                key={setIdx}
                className={cn(
                  'grid grid-cols-[24px_1fr_1fr_52px] items-center gap-2 rounded-2xl px-1 py-1 transition-colors',
                  s.done && 'bg-accent/10',
                )}
              >
                <span className="text-center text-sm text-muted-foreground tabular-nums">
                  {setIdx + 1}
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={s.reps === 0 ? '' : s.reps}
                  onChange={(e) =>
                    onSetChange(setIdx, 'reps', Number(e.target.value))
                  }
                  className="h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-[15px] text-foreground tabular-nums outline-none focus:border-accent"
                />
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={s.loadKg === 0 ? '' : s.loadKg}
                  placeholder="—"
                  onChange={(e) =>
                    onSetChange(setIdx, 'loadKg', Number(e.target.value))
                  }
                  className="h-11 w-full min-w-0 rounded-xl border border-border bg-background px-3 text-[15px] text-foreground tabular-nums outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => onSetDone(setIdx)}
                  aria-label={s.done ? 'Mark set not done' : 'Mark set done'}
                  className={cn(
                    'ml-auto flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                    s.done
                      ? 'border-accent bg-accent text-accent-foreground'
                      : 'border-border text-muted-foreground hover:bg-muted',
                  )}
                >
                  <Check className="h-4 w-4" strokeWidth={2.4} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground transition-colors hover:bg-muted"
          >
            <Repeat2 className="h-3.5 w-3.5" />
            Substitute
          </button>

          {picking && (
            <div className="mt-2 flex flex-col gap-1 rounded-2xl border border-border bg-background p-2">
              {swapped && (
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
              {subs.length === 0 && !swapped && (
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
      {exercise && <ExerciseGlyph equipment={exercise.equipment} size="sm" />}
      <span className="text-[14px] font-medium text-foreground">{label}</span>
    </button>
  )
}
