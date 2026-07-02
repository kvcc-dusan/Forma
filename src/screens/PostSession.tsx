import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { BackButton } from '@/components/back-button'
import { PageHeader } from '@/components/page-header'
import { ScalePicker } from '@/components/primitives'
import {
  ExerciseLogField,
  type LogEntry,
} from '@/components/exercise-log-field'
import { getExercise, program } from '@/lib/program'
import { nextLiftingDay } from '@/lib/rotation'
import { computeTarget } from '@/lib/progression'
import { getSubs, clearDraft } from '@/lib/session-draft'
import { addSession, uuid } from '@/lib/db'
import { useSessions } from '@/hooks/useStore'
import { isFieldVisible, type SurveyValues } from '@/lib/survey'
import { todayISO } from '@/lib/utils'
import type {
  DayExercise,
  ExerciseLog,
  LiftingDay,
  SessionLog,
  SurveyField,
} from '@/lib/types'

// Pre-fill the exercise-log from today's prescription: reps default to the
// computed target, load defaults to last session's working load.
const buildEntries = (
  day: LiftingDay,
  subs: Record<string, string>,
  sessions: SessionLog[],
): LogEntry[] => {
  const entries: LogEntry[] = []
  for (const dx of day.exercises) {
    const effectiveId = subs[dx.exerciseId] ?? dx.exerciseId
    const exercise = getExercise(effectiveId)
    if (!exercise) continue
    const effectiveDx: DayExercise = { ...dx, exerciseId: effectiveId }
    const target = computeTarget(effectiveDx, sessions)
    const lastLoad = target.last
      ? target.last.sets.reduce((m, s) => Math.max(m, s.loadKg), 0)
      : 0
    const defaultLoad = lastLoad > 0 ? lastLoad : (target.loadKg ?? 0)
    const log: ExerciseLog = {
      exerciseId: effectiveId,
      completed: true,
      sets: Array.from({ length: dx.sets }, () => ({
        reps: target.repsTarget,
        loadKg: defaultLoad,
      })),
    }
    entries.push({ exercise, log })
  }
  return entries
}

export function PostSession() {
  const navigate = useNavigate()
  const { sessions, loading, reload } = useSessions()

  const day = useMemo(() => nextLiftingDay(sessions), [sessions])
  const built = useMemo(
    () => buildEntries(day, getSubs(day.id), sessions),
    [day, sessions],
  )

  const [entries, setEntries] = useState<LogEntry[]>([])
  const [values, setValues] = useState<SurveyValues>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading) setEntries(built)
  }, [loading, built])

  const setValue = (key: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [key]: v }))

  const submit = async () => {
    setSaving(true)
    const session: SessionLog = {
      id: uuid(),
      dayId: day.id,
      date: todayISO(),
      perExercise: entries.map((e) => e.log),
      sessionRpe: numberOrUndef(values.sessionRpe),
      energy: numberOrUndef(values.energy),
      mood: numberOrUndef(values.mood),
      palpitations: Boolean(values.palpitations),
      palpitationsNote: strOrUndef(values.palpitationsNote),
      painFlag: Boolean(values.painFlag),
      painNote: strOrUndef(values.painNote),
      durationMin: numberOrUndef(values.durationMin),
      notes: strOrUndef(values.notes),
    }
    await addSession(session)
    clearDraft()
    await reload()
    // Rotation advances automatically: the new session becomes the most recent
    // lifting log, so Today resolves to the next day in A -> B -> C.
    navigate('/')
  }

  return (
    <AppShell hideNav>
      <div className="flex flex-col gap-6 pb-8">
        <div className="flex items-center gap-3">
          <BackButton />
          <PageHeader eyebrow={day.name.split(' — ')[0]} title="Log session" />
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-card" />
        ) : (
          program.survey.fields.map((field) => (
            <SurveyFieldView
              key={field.key}
              field={field}
              values={values}
              entries={entries}
              onValue={setValue}
              onEntries={setEntries}
            />
          ))
        )}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 md:left-56 bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-10">
        <button
          type="button"
          disabled={saving || loading}
          onClick={submit}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-[15px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
          {saving ? 'Saving…' : 'Save & advance rotation'}
        </button>
      </div>
    </AppShell>
  )
}

function SurveyFieldView({
  field,
  values,
  entries,
  onValue,
  onEntries,
}: {
  field: SurveyField
  values: SurveyValues
  entries: LogEntry[]
  onValue: (key: string, v: unknown) => void
  onEntries: (next: LogEntry[]) => void
}) {
  if (!isFieldVisible(field, values)) return null

  if (field.type === 'exercise-log') {
    return (
      <section className="flex flex-col gap-3">
        <Label>Exercises</Label>
        <ExerciseLogField entries={entries} onChange={onEntries} />
      </section>
    )
  }

  if (field.type === 'scale') {
    return (
      <section className="flex flex-col gap-3">
        <Label>{field.label}</Label>
        <ScalePicker
          min={field.min ?? 1}
          max={field.max ?? 5}
          value={values[field.key] as number | undefined}
          onChange={(v) => onValue(field.key, v)}
        />
      </section>
    )
  }

  if (field.type === 'boolean') {
    const on = Boolean(values[field.key])
    return (
      <section className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
        <span className="text-[14px] font-medium text-card-foreground">
          {field.label}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          onClick={() => onValue(field.key, !on)}
          className={
            'relative h-7 w-12 shrink-0 rounded-full transition-colors ' +
            (on ? 'bg-accent' : 'bg-secondary')
          }
        >
          <span
            className={
              'absolute top-1 h-5 w-5 rounded-full bg-background transition-transform ' +
              (on ? 'translate-x-6' : 'translate-x-1')
            }
          />
        </button>
      </section>
    )
  }

  if (field.type === 'number') {
    return (
      <section className="flex flex-col gap-3">
        <Label>{field.label}</Label>
        <input
          type="number"
          inputMode="numeric"
          value={(values[field.key] as number | undefined) ?? ''}
          onChange={(e) =>
            onValue(field.key, e.target.value === '' ? undefined : Number(e.target.value))
          }
          className="h-12 rounded-2xl border border-border bg-card px-4 text-[15px] text-foreground tabular-nums outline-none focus:border-accent"
        />
      </section>
    )
  }

  // text
  return (
    <section className="flex flex-col gap-3">
      <Label>{field.label}</Label>
      <textarea
        rows={field.key === 'notes' ? 3 : 2}
        value={(values[field.key] as string | undefined) ?? ''}
        onChange={(e) => onValue(field.key, e.target.value)}
        className="resize-none rounded-2xl border border-border bg-card px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus:border-accent"
      />
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
      {children}
    </h2>
  )
}

const numberOrUndef = (v: unknown): number | undefined =>
  typeof v === 'number' && !Number.isNaN(v) ? v : undefined

const strOrUndef = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
