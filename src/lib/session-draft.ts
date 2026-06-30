// The in-flight session lives in localStorage so substitutions ("this session
// only") survive the hop from Today -> Post-session, and so an accidental
// reload mid-gym doesn't lose the chosen swaps. Cleared on submit.

const KEY = 'forma-session-draft'

export interface SessionDraft {
  dayId: string
  // map of original exerciseId -> substitute exerciseId, for this session only
  subs: Record<string, string>
}

export const readDraft = (): SessionDraft | null => {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SessionDraft) : null
  } catch {
    return null
  }
}

export const writeDraft = (draft: SessionDraft): void => {
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export const clearDraft = (): void => {
  localStorage.removeItem(KEY)
}

// Read (or lazily create) the substitution map for a given day.
export const getSubs = (dayId: string): Record<string, string> => {
  const draft = readDraft()
  if (draft && draft.dayId === dayId) return draft.subs
  return {}
}

export const setSub = (
  dayId: string,
  originalId: string,
  substituteId: string | null,
): Record<string, string> => {
  const current = getSubs(dayId)
  const next = { ...current }
  if (substituteId === null) delete next[originalId]
  else next[originalId] = substituteId
  writeDraft({ dayId, subs: next })
  return next
}
