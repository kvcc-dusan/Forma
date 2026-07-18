import { Flame, Snowflake } from 'lucide-react'
import { program } from '@/lib/program'

// Warm-up reminder shown at the top of every lifting session, and the matching
// cool-down reminder. Both are non-optional per the heart-safe requirements.

export function WarmupCard() {
  const { cardioMin, cardioNote, rampSets } = program.warmup
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Flame className="h-[17px] w-[17px] text-accent" strokeWidth={2} />
        <h3 className="text-[12px] font-semibold uppercase tracking-label text-card-foreground">
          Warm-up · {cardioMin} min
        </h3>
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {cardioNote}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        {rampSets}
      </p>
    </div>
  )
}

export function CooldownCard() {
  const { cooldownMin, cooldownNote } = program.warmup
  return (
    <div className="rounded-2xl bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Snowflake className="h-[17px] w-[17px] text-accent" strokeWidth={2} />
        <h3 className="text-[12px] font-semibold uppercase tracking-label text-card-foreground">
          Cool-down · {cooldownMin} min
        </h3>
      </div>
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        {cooldownNote}
      </p>
    </div>
  )
}
