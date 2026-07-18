import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BottomNav, SideNav } from './nav'

interface AppShellProps {
  children: ReactNode
  // Hide navigation chrome (used by focused flows like an active session).
  hideNav?: boolean
  // Fill the viewport exactly, content must fit with no internal scroll
  // either — the main element becomes a flex column so a direct child can
  // flex-1 to fill the remaining space (see Home, Workouts). Screens that
  // don't pass this still never let the *document* scroll (see index.css) —
  // they scroll inside `main` instead.
  fixed?: boolean
  className?: string
}

/**
 * Responsive application shell.
 * Mobile: full-viewport content with a bottom tab bar.
 * Desktop (md+): left sidebar, content centered in the remaining space.
 *
 * The root is always exactly one viewport tall — the document/body never
 * scroll (locked in index.css). `main` is the one designated scroll region,
 * either flex-fixed-to-fit (`fixed`) or its own `overflow-y-auto`.
 */
export function AppShell({ children, hideNav, fixed, className }: AppShellProps) {
  return (
    <div className={cn('h-dvh overflow-hidden bg-background', !hideNav && 'md:pl-56')}>
      {!hideNav && <SideNav />}
      <main
        className={cn(
          'mx-auto h-full w-full max-w-lg px-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-3xl md:px-10 md:pt-10',
          hideNav ? 'pb-12 md:max-w-2xl' : 'pb-28 md:pb-12',
          fixed
            ? 'flex flex-col gap-4 overflow-hidden'
            : 'overflow-y-auto',
          className,
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
