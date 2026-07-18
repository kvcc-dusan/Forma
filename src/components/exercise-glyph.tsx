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
  image,
  size = 'md',
  className,
}: {
  equipment: Equipment
  image?: string
  size?: keyof typeof sizeClass
  className?: string
}) {
  const Icon = equipmentIcon[equipment] ?? Dumbbell
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={cn(
          'shrink-0 rounded-2xl object-cover',
          sizeClass[size],
          className,
        )}
      />
    )
  }
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-secondary to-card text-muted-foreground',
        sizeClass[size],
        className,
      )}
    >
      <Icon className={iconSize[size]} strokeWidth={1.6} />
    </div>
  )
}

// Large media tile (Exercise Detail hero, session card). Renders the exercise
// illustration when present; until images land, a calm placeholder tile.
export function ExerciseMedia({
  equipment,
  image,
  className,
}: {
  equipment: Equipment
  image?: string
  className?: string
}) {
  const Icon = equipmentIcon[equipment] ?? Dumbbell
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={cn(
          'aspect-[4/3] w-full rounded-3xl object-cover',
          className,
        )}
      />
    )
  }
  return (
    <div
      className={cn(
        'flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-gradient-to-br from-secondary/70 to-card',
        className,
      )}
    >
      <Icon className="h-10 w-10 text-muted-foreground/50" strokeWidth={1.2} />
    </div>
  )
}
