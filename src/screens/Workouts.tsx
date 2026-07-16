import { Link } from 'react-router-dom'
import { ChevronRight, Clock, HeartPulse, Layers } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Tag } from '@/components/primitives'
import { estimateDayMinutes, program } from '@/lib/program'

// Browse every program day — open any workout any time, independent of the
// schedule. Starting one from its detail page pulls the rotation along.
export function Workouts() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow={program.meta.name} title="Workouts" />

        <div className="flex flex-col gap-3">
          {program.days.map((day) => {
            const [focus, detail] = day.name.split(' — ')
            const isCardio = day.type === 'cardio'
            return (
              <Link
                key={day.id}
                to={`/workout/${day.id}`}
                className="group rounded-3xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-center justify-between gap-3">
                  <Tag tone="accent">{isCardio ? 'Cardio' : focus}</Tag>
                  <ChevronRight
                    className="h-[18px] w-[18px] text-muted-foreground"
                    strokeWidth={1.6}
                  />
                </div>
                <h2 className="mt-3 text-[22px] font-semibold tracking-tight text-card-foreground text-display">
                  {focus}
                </h2>
                {detail && (
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {detail}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-4 text-[12px] text-muted-foreground">
                  {isCardio ? (
                    <span className="inline-flex items-center gap-1.5">
                      <HeartPulse className="h-[15px] w-[15px]" strokeWidth={1.8} />
                      steady-state
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-[15px] w-[15px]" strokeWidth={1.8} />
                      {day.exercises.length} exercises
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-[15px] w-[15px]" strokeWidth={1.8} />~
                    {estimateDayMinutes(day)} min
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
