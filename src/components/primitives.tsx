import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-end justify-between', className)}>
      <h2 className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  )
}

export function MetricPill({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon?: LucideIcon
  label: string
  value: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-border bg-card p-4',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.8} /> : null}
        <span className="truncate text-[11px] font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="truncate text-lg font-semibold tracking-tight text-card-foreground">
        {value}
      </span>
    </div>
  )
}

export function Tag({
  children,
  tone = 'muted',
  className,
}: {
  children: ReactNode
  tone?: 'muted' | 'accent' | 'outline' | 'safe'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide',
        tone === 'muted' && 'bg-secondary text-secondary-foreground',
        tone === 'accent' &&
          'bg-accent/15 text-accent ring-1 ring-inset ring-accent/25',
        tone === 'safe' &&
          'bg-safe/15 text-safe ring-1 ring-inset ring-safe/30',
        tone === 'outline' && 'border border-border text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex rounded-full border border-border bg-secondary p-1',
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors',
            value === opt.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  return (
    <div className={cn('h-1.5 w-full rounded-full bg-secondary', className)}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-success' : 'bg-secondary',
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-6 w-6 rounded-full shadow-sm transition-transform duration-200',
          checked
            ? 'translate-x-6 bg-success-foreground'
            : 'translate-x-0 bg-background',
        )}
      />
    </button>
  )
}

export function ScalePicker({
  min,
  max,
  value,
  onChange,
}: {
  min: number
  max: number
  value: number | undefined
  onChange: (v: number) => void
}) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            'h-10 min-w-10 flex-1 rounded-xl border text-[15px] font-medium tabular-nums transition-colors',
            value === n
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-card text-muted-foreground hover:text-foreground',
          )}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
