import { Pause, Play, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

function format(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function RestTimer({
  duration,
  onClose,
}: {
  duration: number
  onClose: () => void
}) {
  const [remaining, setRemaining] = useState(duration)
  const [running, setRunning] = useState(true)
  const [total, setTotal] = useState(duration)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          // a gentle vibration when rest is up, where supported
          if ('vibrate' in navigator) navigator.vibrate(200)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const pct = total === 0 ? 0 : ((total - remaining) / total) * 100
  const R = 52
  const C = 2 * Math.PI * R

  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center">
      <button
        type="button"
        aria-label="Dismiss rest timer"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full rounded-t-[2rem] border-t border-border bg-card px-6 pb-10 pt-4 duration-300 animate-in slide-in-from-bottom">
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            Rest
          </p>
          <button
            type="button"
            aria-label="Skip rest"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mx-auto my-6 flex h-36 w-36 items-center justify-center">
          <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C - (pct / 100) * C}
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>
          <span className="text-4xl font-semibold tabular-nums tracking-tight text-card-foreground">
            {format(remaining)}
          </span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRemaining((r) => r + 15)
              setTotal((t) => t + 15)
            }}
            className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-4 py-2.5 text-[13px] font-medium text-secondary-foreground"
          >
            <Plus className="h-4 w-4" /> 15s
          </button>
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
            aria-label={running ? 'Pause' : 'Resume'}
          >
            {running ? (
              <Pause className="h-5 w-5 fill-current" strokeWidth={0} />
            ) : (
              <Play className="h-5 w-5 fill-current" strokeWidth={0} />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border bg-secondary px-4 py-2.5 text-[13px] font-medium text-secondary-foreground"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
