import { useMemo } from 'react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { MetricPill, SectionHeader } from '@/components/primitives'
import { LineCard } from '@/components/line-card'
import { useSessions } from '@/hooks/useStore'
import { completionSeries, scalarSeries } from '@/lib/analytics'
import { deriveSchedule } from '@/lib/schedule'

// Consistency over kilograms: this screen answers "am I showing up and how
// does training feel", nothing else. No loads, no PRs, no bodyweight.
export function Progress() {
  const { sessions, loading } = useSessions()

  const schedule = useMemo(
    () => (loading ? null : deriveSchedule(sessions)),
    [sessions, loading],
  )
  const weekLifts =
    schedule?.week.filter(
      (d) => d.status === 'done' && d.dayId && d.dayId !== 'zone2',
    ).length ?? 0
  const weekCardio = schedule?.week.some(
    (d) => d.status === 'done' && d.dayId === 'zone2',
  )
    ? 1
    : 0

  const completion = useMemo(() => completionSeries(sessions), [sessions])
  const energy = useMemo(() => scalarSeries(sessions, 'energy'), [sessions])
  const mood = useMemo(() => scalarSeries(sessions, 'mood'), [sessions])
  const rpe = useMemo(() => scalarSeries(sessions, 'sessionRpe'), [sessions])

  const sessionCount = sessions.length

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader
          eyebrow={`${sessionCount} session${sessionCount === 1 ? '' : 's'} logged`}
          title="Progress"
        />

        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-card" />
        ) : (
          <>
            <section className="grid grid-cols-3 gap-3">
              <MetricPill label="This week" value={`${weekLifts}/3 lifts`} />
              <MetricPill label="Cardio" value={`${weekCardio}/1 done`} />
              <MetricPill label="All time" value={`${sessionCount} sessions`} />
            </section>

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

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
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

            <section className="flex flex-col gap-3">
              <SectionHeader title="Session difficulty" />
              <LineCard
                title="RPE"
                data={rpe}
                domain={[1, 10]}
                height={120}
                emptyHint="Rate session difficulty to see the trend."
              />
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
