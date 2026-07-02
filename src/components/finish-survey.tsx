import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { program } from '@/lib/program'
import { isFieldVisible, type SurveyValues } from '@/lib/survey'
import type { SurveyField } from '@/lib/types'
import { ScalePicker } from './primitives'

// The post-workout check-in, rendered from program.json.survey.fields as a
// bottom sheet. The exercise-log field is skipped — set data was captured live
// during the session. Duration is prefilled from the session clock.

export interface SurveyResult {
  sessionRpe?: number
  energy?: number
  mood?: number
  palpitations: boolean
  palpitationsNote?: string
  painFlag: boolean
  painNote?: string
  durationMin?: number
  notes?: string
}

export function FinishSurvey({
  durationMin,
  saving,
  onSubmit,
  onCancel,
}: {
  durationMin: number
  saving: boolean
  onSubmit: (result: SurveyResult) => void
  onCancel: () => void
}) {
  const [values, setValues] = useState<SurveyValues>({ durationMin })

  const fields = program.survey.fields.filter((f) => f.type !== 'exercise-log')
  const setValue = (key: string, v: unknown) =>
    setValues((prev) => ({ ...prev, [key]: v }))

  const submit = () => {
    onSubmit({
      sessionRpe: num(values.sessionRpe),
      energy: num(values.energy),
      mood: num(values.mood),
      palpitations: Boolean(values.palpitations),
      palpitationsNote: str(values.palpitationsNote),
      painFlag: Boolean(values.painFlag),
      painNote: str(values.painNote),
      durationMin: num(values.durationMin),
      notes: str(values.notes),
    })
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="fixed inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="no-scrollbar relative z-10 max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border-t border-border bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 duration-300 animate-in slide-in-from-bottom md:max-h-[80vh] md:rounded-3xl md:border md:pb-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold tracking-tight text-card-foreground">
            How did it go?
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {fields.map((field) => (
            <FieldView
              key={field.key}
              field={field}
              values={values}
              onValue={setValue}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={submit}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
          {saving ? 'Saving…' : 'Save session'}
        </button>
      </div>
    </div>
  )
}

function FieldView({
  field,
  values,
  onValue,
}: {
  field: SurveyField
  values: SurveyValues
  onValue: (key: string, v: unknown) => void
}) {
  if (!isFieldVisible(field, values)) return null

  if (field.type === 'scale') {
    return (
      <section className="flex flex-col gap-2.5">
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
      <section className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4">
        <span className="text-[14px] font-medium text-foreground">
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
              'absolute top-1 h-5 w-5 rounded-full bg-card transition-transform ' +
              (on ? 'translate-x-6' : 'translate-x-1')
            }
          />
        </button>
      </section>
    )
  }

  if (field.type === 'number') {
    return (
      <section className="flex flex-col gap-2.5">
        <Label>{field.label}</Label>
        <input
          type="number"
          inputMode="numeric"
          value={(values[field.key] as number | undefined) ?? ''}
          onChange={(e) =>
            onValue(
              field.key,
              e.target.value === '' ? undefined : Number(e.target.value),
            )
          }
          className="h-12 rounded-2xl border border-border bg-background px-4 text-[15px] text-foreground tabular-nums outline-none focus:border-accent"
        />
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-2.5">
      <Label>{field.label}</Label>
      <textarea
        rows={2}
        value={(values[field.key] as string | undefined) ?? ''}
        onChange={(e) => onValue(field.key, e.target.value)}
        className="resize-none rounded-2xl border border-border bg-background px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus:border-accent"
      />
    </section>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
      {children}
    </h3>
  )
}

const num = (v: unknown): number | undefined =>
  typeof v === 'number' && !Number.isNaN(v) ? v : undefined

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
