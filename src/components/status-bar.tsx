import { useEffect, useState } from 'react'

// A faithful iOS-style status bar (matching the V0 device frame), with one
// functional addition: the wifi glyph dims when the app is offline, a quiet
// reassurance that the app still works with no signal in the gym.
export function StatusBar() {
  const [online, setOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  )
  const [time, setTime] = useState(() => clock())

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const id = window.setInterval(() => setTime(clock()), 30_000)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      window.clearInterval(id)
    }
  }, [])

  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[13px] font-medium tabular-nums text-foreground/90">
      <span>{time}</span>
      <div className="flex items-center gap-1.5">
        {/* signal */}
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none" aria-hidden="true">
          <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
          <rect x="4.5" y="5" width="3" height="6" rx="1" fill="currentColor" />
          <rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
          <rect x="13.5" y="0" width="3" height="11" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
        {/* wifi — dimmed when offline */}
        <svg
          width="16"
          height="11"
          viewBox="0 0 16 11"
          fill="none"
          aria-hidden="true"
          style={{ opacity: online ? 1 : 0.3 }}
        >
          <path
            d="M8 9.8a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6zM3.2 5.4a6.8 6.8 0 019.6 0M.8 3a10.2 10.2 0 0114.4 0M5.5 7.7a3.4 3.4 0 014.9 0"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        {/* battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="8" rx="1.6" fill="currentColor" />
          <rect x="23" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    </div>
  )
}

function clock(): string {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
