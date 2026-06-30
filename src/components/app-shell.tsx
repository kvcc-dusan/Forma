import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { StatusBar } from './status-bar'
import { TabBar } from './tab-bar'

interface AppShellProps {
  children: ReactNode
  hideTabBar?: boolean
  className?: string
}

/**
 * Centered device frame. On large screens it reads as a premium iPhone-sized
 * canvas; on mobile it fills the viewport. The content area scrolls behind a
 * fixed status bar and bottom tab bar.
 */
export function AppShell({ children, hideTabBar, className }: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[radial-gradient(140%_120%_at_50%_-10%,color-mix(in_oklch,var(--foreground)_5%,var(--background)),var(--background))] sm:items-center sm:py-8">
      <div className="relative flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-background sm:h-[896px] sm:rounded-[2.75rem] sm:border sm:border-border sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.55)]">
        <StatusBar />
        <main
          className={cn(
            'no-scrollbar flex-1 overflow-y-auto overscroll-contain',
            className,
          )}
        >
          {children}
        </main>
        {!hideTabBar && <TabBar />}
      </div>
    </div>
  )
}
