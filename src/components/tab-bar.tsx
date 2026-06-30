import { Activity, Dumbbell, Heart, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const tabs = [
  { to: '/', label: 'Today', icon: Dumbbell, end: true },
  { to: '/zone2', label: 'Zone 2', icon: Heart, end: false },
  { to: '/progress', label: 'Progress', icon: TrendingUp, end: false },
  { to: '/settings', label: 'Settings', icon: Activity, end: false },
]

export function TabBar() {
  return (
    <nav className="pointer-events-auto border-t border-border bg-background/80 px-2 pb-6 pt-2.5 backdrop-blur-xl">
      <ul className="flex items-stretch justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                end={tab.end}
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
                      {tab.label}
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
