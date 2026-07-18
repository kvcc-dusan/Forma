import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, HeartPulse, Layers } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { Tag } from '@/components/primitives'
import { estimateDayMinutes, program } from '@/lib/program'

// Browse every program day — open any workout any time, independent of the
// schedule. Starting one from its detail page pulls the rotation along.
export function Workouts() {
  return (
    <AppShell fixed>
      <div className="shrink-0">
        <PageHeader eyebrow={program.meta.name} title="Workouts" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {program.days.map((day) => {
          const [focus, detail] = day.name.split(' — ')
          const isCardio = day.type === 'cardio'
          return (
            <Link
              key={day.id}
              to={`/workout/${day.id}`}
              className="flex items-center gap-3 rounded-3xl bg-card px-4 py-4 transition-colors hover:bg-secondary/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Tag tone="accent" className="shrink-0">
                    {isCardio ? 'Cardio' : focus}
                  </Tag>
                  <h2 className="truncate text-[17px] font-semibold tracking-tight text-card-foreground">
                    {focus}
                  </h2>
                </div>
                {detail && (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {detail}
                  </p>
                )}
                <div className="mt-1.5 flex items-center gap-3 text-[12px] text-muted-foreground">
                  {isCardio ? (
                    <span className="inline-flex items-center gap-1.5">
                      <HeartPulse className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      steady-state
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Layers className="h-[14px] w-[14px]" strokeWidth={1.8} />
                      {day.exercises.length} exercises
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-[14px] w-[14px]" strokeWidth={1.8} />~
                    {estimateDayMinutes(day)} min
                  </span>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-muted-foreground"
                strokeWidth={1.8}
              />
            </Link>
          )
        })}
      </div>
    </AppShell>
  )
}
