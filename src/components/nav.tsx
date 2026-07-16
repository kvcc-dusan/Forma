import { Dumbbell, House, Settings2, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/', label: 'Home', icon: House, end: true },
  { to: '/workouts', label: 'Workouts', icon: Dumbbell, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
  { to: '/settings', label: 'Settings', icon: Settings2, end: false },
]

// Bottom tab bar — mobile only. Safe-area padded for phones with home
// indicators; hidden on md+ where the sidebar takes over.
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/85 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors',
                    isActive
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground/80',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="h-[22px] w-[22px]"
                      strokeWidth={isActive ? 2.1 : 1.6}
                    />
                    <span className="text-[10px] font-medium tracking-wide">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

// Left sidebar — desktop only.
export function SideNav() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-background md:flex">
      <div className="flex items-center gap-2.5 px-6 pt-7 pb-8">
        <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
        <span className="text-[17px] font-semibold tracking-tight text-foreground">
          Forma
        </span>
      </div>
      <ul className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="h-[19px] w-[19px]"
                      strokeWidth={isActive ? 2.1 : 1.7}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
      <p className="mt-auto px-6 pb-6 text-[11px] text-muted-foreground/60">
        Offline-first · your data stays on device
      </p>
    </aside>
  )
}
