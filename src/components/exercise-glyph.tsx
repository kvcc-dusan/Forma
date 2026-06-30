import {
  Cable,
  Dumbbell,
  Grid2x2,
  PersonStanding,
  type LucideIcon,
} from 'lucide-react'
import type { Equipment } from '@/lib/types'
import { cn } from '@/lib/utils'

// The new exercise library has no photography, so exercises are represented by
// a calm monochrome tile keyed to their equipment. Keeps the V0 rounded-media
// rhythm while staying fully offline (no image fetching at all).

const equipmentIcon: Record<Equipment, LucideIcon> = {
  barbell: Dumbbell,
  dumbbell: Dumbbell,
  machine: Grid2x2,
  cable: Cable,
  bodyweight: PersonStanding,
}

const sizeClass = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-[72px] w-[72px]',
} as const

const iconSize = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
} as const

export function ExerciseGlyph({
  equipment,
  size = 'md',
  className,
}: {
  equipment: Equipment
  size?: keyof typeof sizeClass
  className?: string
}) {
  const Icon = equipmentIcon[equipment] ?? Dumbbell
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-secondary to-card text-muted-foreground',
        sizeClass[size],
        className,
      )}
    >
      <Icon className={iconSize[size]} strokeWidth={1.6} />
    </div>
  )
}
