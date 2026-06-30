import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { SectionHeader, Tag } from '@/components/primitives'
import { ThemeToggle } from '@/components/theme-toggle'
import { WarmupCard, CooldownCard } from '@/components/warmup-card'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { ExerciseTargetCard } from '@/components/exercise-target-card'
import { RestTimer } from '@/components/rest-timer'
import { getExercise, program } from '@/lib/program'
import { nextLiftingDay, rotationLabel } from '@/lib/rotation'
import { computeTarget } from '@/lib/progression'
import { getSubs, setSub } from '@/lib/session-draft'
import { useSessions } from '@/hooks/useStore'
import type { DayExercise, Exercise } from '@/lib/types'

const restSecondsFor = (ex: Exercise): number =>
  ex.pattern.startsWith('accessory') || ex.pattern === 'core'
    ? program.meta.accessoryRestSec
    : program.meta.defaultRestSec

const weekdayLabel = (): string =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

export function Today() {
  const navigate = useNavigate()
  const { sessions, loading } = useSessions()

  const day = useMemo(() => nextLiftingDay(sessions), [sessions])
  const [subs, setSubs] = useState<Record<string, string>>(() =>
    getSubs(day.id),
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [timer, setTimer] = useState<number | null>(null)

  // Resolve each prescribed exercise (honouring this-session substitutions) and
  // compute its double-progression target from history.
  const rows = useMemo(() => {
    return day.exercises.map((dx: DayExercise) => {
      const subId = subs[dx.exerciseId]
      const effectiveId = subId ?? dx.exerciseId
      const exercise = getExercise(effectiveId)
      const original = subId ? getExercise(dx.exerciseId) : undefined
      const effectiveDx: DayExercise = { ...dx, exerciseId: effectiveId }
      const target = computeTarget(effectiveDx, sessions)
      return { dx, exercise, original, target }
    })
  }, [day, subs, sessions])

  const handleSubstitute = (originalId: string, substituteId: string | null) => {
    const next = setSub(day.id, originalId, substituteId)
    setSubs({ ...next })
  }

  const handleDone = (index: number) => {
    setDone((prev) => new Set(prev).add(index))
    const ex = rows[index]?.exercise
    if (ex) setTimer(restSecondsFor(ex))
    // advance the "current" pointer to the next not-done exercise
    const nextIdx = rows.findIndex((_, i) => i > index && !done.has(i))
    if (nextIdx !== -1) setCurrentIndex(nextIdx)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 px-5 pb-28 pt-2">
        <PageHeader
          eyebrow={weekdayLabel()}
          title={day.name.split(' — ')[0]}
          actions={<ThemeToggle />}
        />

        <div className="flex flex-wrap items-center gap-2">
          <Tag tone="accent">{rotationLabel(day)}</Tag>
          {day.name.includes('—') && (
            <Tag tone="outline">{day.name.split(' — ')[1]}</Tag>
          )}
          <Tag tone="safe">RIR {program.meta.globalRir.join('–')}</Tag>
        </div>

        <WarmupCard />

        <section className="flex flex-col gap-3">
          <SectionHeader title="Exercises" />
          {loading ? (
            <div className="h-40 animate-pulse rounded-3xl bg-card" />
          ) : (
            rows.map((row, i) =>
              row.exercise ? (
                <ExerciseTargetCard
                  key={`${row.dx.exerciseId}-${i}`}
                  exercise={row.exercise}
                  prescription={{ sets: row.dx.sets, repRange: row.dx.repRange }}
                  target={row.target}
                  current={i === currentIndex && !done.has(i)}
                  done={done.has(i)}
                  onMarkDone={() => handleDone(i)}
                  onRest={() =>
                    row.exercise && setTimer(restSecondsFor(row.exercise))
                  }
                  onSubstitute={(subId) =>
                    handleSubstitute(row.dx.exerciseId, subId)
                  }
                  originalName={row.original?.name}
                />
              ) : null,
            )
          )}
        </section>

        <CooldownCard />

        <HeartSafeBlock
          title="Session rules"
          notes={program.constraints.rules.slice(0, 4)}
          compact
        />
      </div>

      {/* sticky log action */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-background via-background to-transparent px-5 pb-6 pt-10">
        <button
          type="button"
          onClick={() => navigate('/log')}
          className="pointer-events-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <ClipboardCheck className="h-[18px] w-[18px]" strokeWidth={2} />
          Log this session
        </button>
      </div>

      {timer !== null && (
        <RestTimer duration={timer} onClose={() => setTimer(null)} />
      )}
    </AppShell>
  )
}
