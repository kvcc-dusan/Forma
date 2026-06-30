import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({
  eyebrow,
  title,
  actions,
  className,
}: {
  eyebrow?: string
  title: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <header className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-[12px] font-medium text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-display text-balance text-[34px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 pt-1">{actions}</div>
      ) : null}
    </header>
  )
}
