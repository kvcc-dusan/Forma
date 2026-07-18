import { Check } from 'lucide-react'
import type { PlannedDay } from '@/lib/types'
import { cn } from '@/lib/utils'

// A past day with nothing logged ("missed" internally, for queue math) reads
// identically to a rest day here — there's no guilt UI, just a quiet dot.
const isRestLike = (status: PlannedDay['status']): boolean =>
  status === 'rest' || status === 'missed'

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
    <div className="grid grid-cols-7 gap-2">
      {week.map((day, i) => (
        <button
          type="button"
          key={day.date}
          data-status={day.status}
          data-day={day.dayId ?? ''}
          onClick={() => onDayTap?.(day)}
          className="flex flex-col items-center gap-2"
        >
          <span
            className={cn(
              'text-[11px] font-medium',
              day.isToday ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {DAY_LETTERS[i]}
          </span>
          <span
            className={cn(
              'flex size-9 items-center justify-center rounded-lg text-[12px] font-semibold',
              day.status === 'done' && 'bg-success text-success-foreground',
              day.status === 'planned' &&
                !day.isToday &&
                'bg-secondary text-secondary-foreground',
              isRestLike(day.status) &&
                !day.isToday &&
                'bg-secondary/40 text-muted-foreground/50',
              day.isToday &&
                day.status !== 'done' &&
                'bg-foreground text-background',
            )}
          >
            {day.status === 'done' ? (
              <Check className="h-4 w-4" strokeWidth={2.6} />
            ) : isRestLike(day.status) ? (
              '·'
            ) : (
              dayLabel(day.dayId)
            )}
          </span>
        </button>
      ))}
    </div>
  )
}
