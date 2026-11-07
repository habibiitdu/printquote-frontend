// Form inputs keep their values as strings so a field can be blank.
// These helpers convert between the draft strings and API numbers.

/** Parses a draft string. Blank or invalid -> null. */
export function toNumber(s: string | null | undefined): number | null {
  if (s === null || s === undefined) return null
  const t = s.trim()
  if (t === '') return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

/**
 * A required number for a request body. Blank input is sent as null on purpose,
 * so the API answers with a validation error for that field.
 */
export function requiredNumber(s: string): number {
  return toNumber(s) as number
}

/** Number (or null) to a draft string. */
export function toInput(n: number | null | undefined): string {
  return n === null || n === undefined ? '' : String(n)
}

/** Parses "1, 2, 4" into trimmed, non-empty parts. */
export function splitList(s: string | null | undefined): string[] {
  if (!s) return []
  return s
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p !== '')
}

/** Parses "1000, 2500" into positive integers, dropping anything else. */
export function parseQuantities(s: string): number[] {
  return splitList(s)
    .map((p) => Number(p.replace(/_/g, '')))
    .filter((n) => Number.isInteger(n) && n > 0)
}
