import { useCallback, useEffect, useState } from 'react'
import { getAllBodyweight, getAllSessions } from '@/lib/db'
import type { BodyweightEntry, SessionLog } from '@/lib/types'

// Thin reactive wrappers over the IndexedDB stores. Each exposes a `reload`
// so screens can refresh after a write without a global state library.

export function useSessions() {
  const [sessions, setSessions] = useState<SessionLog[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await getAllSessions()
    setSessions(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { sessions, loading, reload }
}

export function useBodyweight() {
  const [entries, setEntries] = useState<BodyweightEntry[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await getAllBodyweight()
    setEntries(all)
    setLoading(false)
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  return { entries, loading, reload }
}
