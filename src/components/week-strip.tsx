import { Check, X } from 'lucide-react'
import type { PlannedDay } from '@/lib/types'
import { cn } from '@/lib/utils'

const DAY_LETTERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Short label for a program day shown inside a week cell.
const dayLabel = (dayId: string | null): string => {
  if (!dayId) return ''
  if (dayId === 'zone2') return 'Z2'
  if (dayId === 'push') return 'P'
  if (dayId === 'pull') return 'PL'
  if (dayId === 'legs') return 'L'
  return dayId.slice(0, 2).toUpperCase()
}

export function WeekStrip({
  week,
  onDayTap,
}: {
  week: PlannedDay[]
  onDayTap?: (day: PlannedDay) => void
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {week.map((day, i) => (
          <button
            type="button"
            key={day.date}
            data-status={day.status}
            data-day={day.dayId ?? ''}
            onClick={() => onDayTap?.(day)}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-medium text-muted-foreground">
              {DAY_LETTERS[i]}
            </span>
            <span
              className={cn(
                'flex aspect-square w-full max-w-10 items-center justify-center rounded-xl text-[11px] font-semibold',
                day.status === 'done' && 'bg-success text-success-foreground',
                day.status === 'missed' &&
                  'border border-dashed border-border text-muted-foreground',
                day.status === 'planned' &&
                  !day.isToday &&
                  'bg-secondary text-secondary-foreground',
                day.status === 'rest' &&
                  !day.isToday &&
                  'bg-secondary/40 text-muted-foreground/50',
                day.isToday &&
                  day.status !== 'done' &&
                  'border-[1.5px] border-foreground bg-background text-foreground',
                day.isToday && day.status === 'done' && 'ring-2 ring-foreground/40',
              )}
            >
              {day.status === 'done' ? (
                <Check className="h-4 w-4" strokeWidth={2.6} />
              ) : day.status === 'missed' ? (
                <X className="h-3.5 w-3.5" strokeWidth={2.2} />
              ) : day.status === 'rest' ? (
                '·'
              ) : (
                dayLabel(day.dayId)
              )}
            </span>
            <span
              className={cn(
                'text-[9px] leading-none',
                day.isToday
                  ? 'font-semibold text-foreground'
                  : 'text-transparent',
              )}
            >
              today
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
