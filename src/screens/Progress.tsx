import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { SectionHeader } from '@/components/primitives'
import { LineCard } from '@/components/line-card'
import { useBodyweight, useSessions } from '@/hooks/useStore'
import { addBodyweight, uuid } from '@/lib/db'
import {
  bodyweightMovingAverage,
  completionSeries,
  loadSeries,
  loggedExercises,
  scalarSeries,
} from '@/lib/analytics'
import { todayDateOnly } from '@/lib/utils'

export function Progress() {
  const { sessions, loading } = useSessions()
  const { entries, reload: reloadBw } = useBodyweight()

  const exercises = useMemo(() => loggedExercises(sessions), [sessions])
  const [selected, setSelected] = useState<string>('')
  const activeId = selected || exercises[0]?.id || ''

  const load = useMemo(
    () => (activeId ? loadSeries(sessions, activeId) : []),
    [sessions, activeId],
  )
  const completion = useMemo(() => completionSeries(sessions), [sessions])
  const bwMA = useMemo(() => bodyweightMovingAverage(entries), [entries])
  const energy = useMemo(() => scalarSeries(sessions, 'energy'), [sessions])
  const mood = useMemo(() => scalarSeries(sessions, 'mood'), [sessions])

  const [bwInput, setBwInput] = useState('')
  const addBw = async () => {
    const kg = Number(bwInput)
    if (!kg || Number.isNaN(kg)) return
    await addBodyweight({ id: uuid(), date: todayDateOnly(), kg })
    setBwInput('')
    await reloadBw()
  }

  const sessionCount = sessions.length

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-4">
        <PageHeader
          eyebrow={`${sessionCount} session${sessionCount === 1 ? '' : 's'} logged`}
          title="Progress"
        />

        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-card" />
        ) : (
          <>
            {/* Per-exercise load over time */}
            <section className="flex flex-col gap-3">
              <SectionHeader title="Load over time" />
              {exercises.length > 0 && (
                <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
                  {exercises.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setSelected(e.id)}
                      className={
                        'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ' +
                        (e.id === activeId
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-border bg-card text-muted-foreground hover:text-foreground')
                      }
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              )}
              <LineCard
                title={
                  exercises.find((e) => e.id === activeId)?.name ?? 'Top-set load'
                }
                unit="kg top set"
                data={load}
                emptyHint="Log this exercise across sessions to see its load trend."
              />
            </section>

            {/* Bodyweight 7-day moving average */}
            <section className="flex flex-col gap-3">
              <SectionHeader title="Bodyweight · 7-day average" />
              <LineCard
                title="Bodyweight"
                unit="kg (7d avg)"
                data={bwMA}
                emptyHint="Add weekly bodyweight entries to track the trend."
                action={
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      value={bwInput}
                      onChange={(e) => setBwInput(e.target.value)}
                      placeholder="kg"
                      className="h-9 w-20 rounded-xl border border-border bg-background px-3 text-sm text-foreground tabular-nums outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={addBw}
                      aria-label="Add bodyweight entry"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                }
              />
            </section>

            {/* Completion rate */}
            <section className="flex flex-col gap-3">
              <SectionHeader title="Session completion" />
              <LineCard
                title="Completion rate"
                unit="%"
                data={completion}
                domain={[0, 100]}
                emptyHint="Complete a few sessions to see your adherence."
              />
            </section>

            {/* Energy + mood */}
            <section className="grid grid-cols-1 gap-3">
              <LineCard
                title="Energy"
                data={energy}
                domain={[1, 5]}
                height={120}
                emptyHint="Rate energy after sessions to see the trend."
              />
              <LineCard
                title="Mood"
                data={mood}
                domain={[1, 5]}
                height={120}
                emptyHint="Rate mood after sessions to see the trend."
              />
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
