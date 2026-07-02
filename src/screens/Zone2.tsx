import { useState } from 'react'
import { Check, Heart, Wind } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { ScalePicker, SectionHeader, Tag } from '@/components/primitives'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { cardioDays } from '@/lib/program'
import { addSession, uuid } from '@/lib/db'
import { useSessions } from '@/hooks/useStore'
import { todayISO } from '@/lib/utils'
import type { SessionLog } from '@/lib/types'

export function Zone2() {
  const day = cardioDays[0]
  const { reload } = useSessions()

  const [duration, setDuration] = useState(day?.durationMin ?? 35)
  const [palpitations, setPalpitations] = useState(false)
  const [palpNote, setPalpNote] = useState('')
  const [energy, setEnergy] = useState<number | undefined>()
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!day) {
    return (
      <AppShell>
        <div className="px-5 pt-4 text-muted-foreground">
          No cardio session configured.
        </div>
      </AppShell>
    )
  }

  const submit = async () => {
    setSaving(true)
    const session: SessionLog = {
      id: uuid(),
      dayId: day.id,
      date: todayISO(),
      perExercise: [],
      durationMin: duration,
      palpitations,
      palpitationsNote: palpNote.trim() || undefined,
      energy,
      notes: notes.trim() || undefined,
    }
    await addSession(session)
    await reload()
    setSaving(false)
    setSaved(true)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-8">
        <PageHeader eyebrow="Steady-state cardio" title="Zone 2" />

        <div className="flex flex-wrap gap-2">
          <Tag tone="accent">{day.durationMin} min</Tag>
          <Tag tone="outline">{day.targetHrPct.join('–')}% HRmax</Tag>
          <Tag tone="safe">Conversational pace</Tag>
        </div>

        {/* Guidance, prominent */}
        <div className="rounded-3xl border border-border bg-card p-5">
          <div className="mb-2.5 flex items-center gap-2">
            <Wind className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
            <h2 className="text-[12px] font-semibold uppercase tracking-label text-card-foreground">
              How to pace it
            </h2>
          </div>
          <p className="text-pretty text-[15px] leading-relaxed text-card-foreground">
            {day.guidance}
          </p>
        </div>

        <HeartSafeBlock
          title="Why perceived exertion"
          notes={[
            'Steady-state only — no intervals, no surges, no sprints.',
            'Wrist HR misreads with ectopic beats; trust breathing and the talk test first.',
            'If you feel dizziness, chest discomfort, or frequent palpitations, stop.',
          ]}
        />

        {/* Lean log */}
        <section className="flex flex-col gap-4">
          <SectionHeader title="Log this session" />

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
              Duration (min)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="h-12 rounded-2xl border border-border bg-card px-4 text-[15px] text-foreground tabular-nums outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
              Energy
            </label>
            <ScalePicker min={1} max={5} value={energy} onChange={setEnergy} />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <span className="flex items-center gap-2 text-[14px] font-medium text-card-foreground">
              <Heart className="h-4 w-4 text-safe" />
              Palpitations / skipped beats?
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={palpitations}
              onClick={() => setPalpitations((p) => !p)}
              className={
                'relative h-7 w-12 shrink-0 rounded-full transition-colors ' +
                (palpitations ? 'bg-safe' : 'bg-secondary')
              }
            >
              <span
                className={
                  'absolute top-1 h-5 w-5 rounded-full bg-background transition-transform ' +
                  (palpitations ? 'translate-x-6' : 'translate-x-1')
                }
              />
            </button>
          </div>

          {palpitations && (
            <textarea
              rows={2}
              value={palpNote}
              onChange={(e) => setPalpNote(e.target.value)}
              placeholder="What did you notice?"
              className="resize-none rounded-2xl border border-border bg-card px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus:border-accent"
            />
          )}

          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else"
            className="resize-none rounded-2xl border border-border bg-card px-4 py-3 text-[15px] leading-relaxed text-foreground outline-none focus:border-accent"
          />
        </section>

        <button
          type="button"
          disabled={saving}
          onClick={submit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-[18px] w-[18px]" strokeWidth={2.4} />
          {saved ? 'Logged ✓' : saving ? 'Saving…' : 'Log Zone 2 session'}
        </button>
        {saved && (
          <p className="-mt-2 text-center text-[13px] text-muted-foreground">
            Saved. Zone 2 does not affect your A → B → C rotation.
          </p>
        )}
      </div>
    </AppShell>
  )
}
