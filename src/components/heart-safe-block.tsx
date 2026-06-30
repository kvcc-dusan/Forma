import { HeartPulse, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

// A deliberately distinct, always-visible safety block. Used on Exercise Detail
// to surface the per-exercise `heartSafe` notes, and reusable for the global
// constraints. Amber "safe" palette keeps it separate from accent and error.
export function HeartSafeBlock({
  notes,
  title = 'Heart-safe',
  compact = false,
  className,
}: {
  notes: string[]
  title?: string
  compact?: boolean
  className?: string
}) {
  if (notes.length === 0) return null
  return (
    <div
      className={cn(
        'rounded-2xl border border-safe/30 bg-safe-surface/60 p-4',
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <HeartPulse className="h-[18px] w-[18px] text-safe" strokeWidth={2} />
        <h3 className="text-[12px] font-semibold uppercase tracking-label text-safe">
          {title}
        </h3>
      </div>
      <ul className={cn('flex flex-col', compact ? 'gap-1.5' : 'gap-2.5')}>
        {notes.map((note) => (
          <li key={note} className="flex gap-2.5">
            <ShieldCheck
              className="mt-0.5 h-[15px] w-[15px] shrink-0 text-safe"
              strokeWidth={2}
            />
            <p className="text-[13px] leading-relaxed text-foreground/90">
              {note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
