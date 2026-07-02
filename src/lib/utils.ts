import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Round a kg load to the nearest 0.5 for clean plate math display.
export const roundLoad = (kg: number): number => Math.round(kg * 2) / 2

export const formatLoad = (kg: number | null): string =>
  kg === null ? '—' : `${roundLoad(kg)} kg`

// "30 Jun", locale-stable short date from an ISO string.
export const formatShortDate = (iso: string): string => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export const todayISO = (): string => new Date().toISOString()

// Local-timezone calendar date (yyyy-mm-dd). Never use toISOString for calendar
// logic — an evening session would land on the wrong day east of UTC.
export const localDate = (d: Date = new Date()): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const todayDateOnly = (): string => localDate()

export const addDays = (dateOnly: string, n: number): string => {
  const [y, m, d] = dateOnly.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return localDate(dt)
}

// Days between two ISO dates (absolute, whole days).
export const daysBetween = (a: string, b: string): number => {
  const ms = Math.abs(new Date(a).getTime() - new Date(b).getTime())
  return Math.floor(ms / 86_400_000)
}

export const relativeDay = (iso: string): string => {
  const d = daysBetween(iso, todayISO())
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d} days ago`
  if (d < 14) return 'last week'
  return formatShortDate(iso)
}
