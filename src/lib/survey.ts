import type { SurveyField } from './types'

export type SurveyValues = Record<string, unknown>

// Evaluate a field's `showIf` against current answers. Supports the schema's
// simple equality form, e.g. "palpitations == true" / "painFlag == false".
// Anything unrecognised defaults to visible (fail open, never hide a question).
export const isFieldVisible = (
  field: SurveyField,
  values: SurveyValues,
): boolean => {
  const cond = field.showIf
  if (!cond) return true

  const match = cond.match(/^\s*(\w+)\s*==\s*(true|false)\s*$/)
  if (!match) return true

  const [, key, expected] = match
  const actual = Boolean(values[key])
  return actual === (expected === 'true')
}
