import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BedDouble,
  CalendarClock,
  Check,
  Eye,
  Play,
  X,
} from 'lucide-react'
import { getDay, getExercise, isLiftingDay } from '@/lib/program'
import { setScheduleDelay } from '@/lib/schedule'
import { createLiveSession, readLiveSession } from '@/lib/live-session'
import { addDays, cn } from '@/lib/utils'
import type { PlannedDay } from '@/lib/types'

// Tap a day in the week strip -> this sheet. Shows what that day holds and,
// for the queue head, lets the workout be moved: "no lift before day X" —
// the whole queue shifts with it.

const longDate = (dateOnly: string): string =>
  new Date(dateOnly + 'T12:00').toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

const shortDay = (dateOnly: string): string =>
  new Date(dateOnly + 'T12:00').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
  })

export function DaySheet({
  day,
  isQueueHead,
  onClose,
  onChanged,
}: {
  day: PlannedDay
  isQueueHead: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const navigate = useNavigate()
  const [pickingDay, setPickingDay] = useState(false)
  const workout = day.dayId ? getDay(day.dayId) : null
  const today = day.isToday

  const startNow = () => {
    if (!day.dayId) return
    if (!readLiveSession()) createLiveSession(day.dayId)
    navigate('/train')
  }

  const moveTo = (date: string) => {
    setScheduleDelay(date)
    onChanged()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center md:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg rounded-t-[1.75rem] border-t border-border bg-card px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 duration-300 animate-in slide-in-from-bottom md:rounded-3xl md:border md:pb-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border md:hidden" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-medium text-muted-foreground">
              {longDate(day.date)}
              {today && ' · today'}
            </p>
            <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-card-foreground text-display">
              {day.status === 'done'
                ? `${workout?.name.split(' — ')[0] ?? 'Session'} — done`
                : day.status === 'missed'
                  ? 'Missed day'
                  : workout
                    ? workout.name.split(' — ')[0]
                    : 'Rest day'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* body per status */}
        {day.status === 'done' && (
          <p className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <Check className="h-4 w-4 text-accent" strokeWidth={2.4} />
            Logged. The rotation moved on from here.
          </p>
        )}

        {day.status === 'missed' && (
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Nothing was logged this day, so its workout moved forward — it's
            still in the queue, nothing is lost.
          </p>
        )}

        {day.status === 'rest' && (
          <p className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <BedDouble className="h-4 w-4 text-accent" strokeWidth={1.8} />
            Recovery day — nothing planned.
          </p>
        )}

        {day.status === 'planned' && workout && (
          <>
            {isLiftingDay(workout) ? (
              <div className="flex flex-col gap-1">
                {workout.exercises.slice(0, 4).map((dx, i) => (
                  <p key={dx.exerciseId} className="text-[13px] text-muted-foreground">
                    <span className="mr-2 tabular-nums text-muted-foreground/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {getExercise(dx.exerciseId)?.name ?? dx.exerciseId}
                  </p>
                ))}
                {workout.exercises.length > 4 && (
                  <p className="text-[13px] text-muted-foreground/60">
                    + {workout.exercises.length - 4} more
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {workout.type === 'cardio' &&
                  `${workout.durationMin} min steady-state · conversational pace`}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate(`/workout/${workout.id}`)
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary text-[14px] font-semibold text-secondary-foreground transition-colors hover:bg-muted"
              >
                <Eye className="h-4 w-4" strokeWidth={2} />
                View workout
              </button>

              {(today || isQueueHead) && (
                <button
                  type="button"
                  onClick={startNow}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Play className="h-4 w-4 fill-current" strokeWidth={0} />
                  Start now
                </button>
              )}

              {isQueueHead && workout.type === 'lifting' && (
                <>
                  <button
                    type="button"
                    onClick={() => moveTo(addDays(day.date, 1))}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <ArrowRight className="h-4 w-4" strokeWidth={2} />
                    Move to tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setPickingDay((p) => !p)}
                    className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-border text-[14px] font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <CalendarClock className="h-4 w-4" strokeWidth={2} />
                    Move to…
                  </button>
                  {pickingDay && (
                    <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                      {Array.from({ length: 6 }, (_, i) =>
                        addDays(day.date, i + 1),
                      ).map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => moveTo(date)}
                          className={cn(
                            'shrink-0 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground',
                          )}
                        >
                          {shortDay(date)}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
