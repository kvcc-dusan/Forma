import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BottomNav, SideNav } from './nav'

interface AppShellProps {
  children: ReactNode
  // Hide navigation chrome (used by focused flows like an active session).
  hideNav?: boolean
  // Fill the viewport exactly, no page scroll — content must fit. The main
  // element becomes a flex column so a direct child can flex-1 to fill the
  // remaining space (see Home, Workouts).
  fixed?: boolean
  className?: string
}

/**
 * Responsive application shell.
 * Mobile: full-viewport content with a bottom tab bar.
 * Desktop (md+): left sidebar, content centered in the remaining space.
 */
export function AppShell({ children, hideNav, fixed, className }: AppShellProps) {
  return (
    <div
      className={cn(
        'bg-background',
        fixed ? 'h-dvh overflow-hidden' : 'min-h-dvh',
        !hideNav && 'md:pl-56',
      )}
    >
      {!hideNav && <SideNav />}
      <main
        className={cn(
          'mx-auto w-full max-w-lg px-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] md:max-w-3xl md:px-10 md:pt-10',
          hideNav ? 'pb-12 md:max-w-2xl' : 'pb-28 md:pb-12',
          fixed && 'flex h-full flex-col gap-4 overflow-hidden',
          className,
        )}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
