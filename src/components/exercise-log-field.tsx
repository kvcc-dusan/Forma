import { Check, Plus } from 'lucide-react'
import type { Exercise, ExerciseLog, SetLog } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ExerciseGlyph } from './exercise-glyph'

export interface LogEntry {
  exercise: Exercise
  log: ExerciseLog
}

// The `exercise-log` survey field: per exercise a completion toggle and an
// editable grid of per-set reps + load, pre-filled from today's prescription.
export function ExerciseLogField({
  entries,
  onChange,
}: {
  entries: LogEntry[]
  onChange: (next: LogEntry[]) => void
}) {
  const update = (idx: number, mutate: (e: LogEntry) => LogEntry) => {
    onChange(entries.map((e, i) => (i === idx ? mutate(e) : e)))
  }

  const updateSet = (
    idx: number,
    setIdx: number,
    field: keyof SetLog,
    value: number,
  ) =>
    update(idx, (e) => ({
      ...e,
      log: {
        ...e.log,
        sets: e.log.sets.map((s, j) =>
          j === setIdx ? { ...s, [field]: value } : s,
        ),
      },
    }))

  const addSet = (idx: number) =>
    update(idx, (e) => {
      const last = e.log.sets[e.log.sets.length - 1]
      return {
        ...e,
        log: {
          ...e.log,
          sets: [
            ...e.log.sets,
            { reps: last?.reps ?? 8, loadKg: last?.loadKg ?? 0 },
          ],
        },
      }
    })

  const toggleDone = (idx: number) =>
    update(idx, (e) => ({ ...e, log: { ...e.log, completed: !e.log.completed } }))

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry, idx) => (
        <div
          key={entry.exercise.id}
          className={cn(
            'overflow-hidden rounded-3xl border bg-card transition-colors',
            entry.log.completed ? 'border-accent/40' : 'border-border',
          )}
        >
          <div className="flex items-center gap-3 p-3">
            <ExerciseGlyph equipment={entry.exercise.equipment} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {entry.exercise.name}
              </p>
              <p className="text-[12px] text-muted-foreground">
                {entry.log.sets.length} sets
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleDone(idx)}
              aria-label={
                entry.log.completed ? 'Mark not completed' : 'Mark completed'
              }
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                entry.log.completed
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted',
              )}
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <div className="border-t border-border px-3 pb-3 pt-1">
            <div className="grid grid-cols-[28px_1fr_1fr] items-center gap-2 px-1 pb-2 pt-3 text-[10px] uppercase tracking-label text-muted-foreground">
              <span>Set</span>
              <span>Reps</span>
              <span>Kg</span>
            </div>
            <div className="space-y-1.5">
              {entry.log.sets.map((s, setIdx) => (
                <div
                  key={setIdx}
                  className="grid grid-cols-[28px_1fr_1fr] items-center gap-2 px-1"
                >
                  <span className="text-center text-sm text-muted-foreground tabular-nums">
                    {setIdx + 1}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    onChange={(e) =>
                      updateSet(idx, setIdx, 'reps', Number(e.target.value))
                    }
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground tabular-nums outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.5"
                    value={s.loadKg}
                    onChange={(e) =>
                      updateSet(idx, setIdx, 'loadKg', Number(e.target.value))
                    }
                    className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground tabular-nums outline-none focus:border-accent"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addSet(idx)}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              Add set
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
