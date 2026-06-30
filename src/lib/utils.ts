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

export const todayDateOnly = (): string =>
  new Date().toISOString().slice(0, 10)

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
