// Number display in Indian grouping (en-IN), e.g. 4,09,467.85.

const moneyFormat = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const quantityFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 3 })
const rateFormat = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 })
const dateFormat = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const dateTimeFormat = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const DASH = '—'

const isNum = (n: number | null | undefined): n is number => typeof n === 'number' && Number.isFinite(n)

/** Money: en-IN grouping, always 2 decimals. 409467.85 -> "4,09,467.85". */
export function formatMoney(n: number | null | undefined): string {
  return isNum(n) ? moneyFormat.format(n) : DASH
}

/** Quantities: en-IN grouping, up to 3 decimals. 125.2 -> "125.2", 25000 -> "25,000". */
export function formatQuantity(n: number | null | undefined): string {
  return isNum(n) ? quantityFormat.format(n) : DASH
}

/** Unit rates: up to 4 decimals so 0.004 per sq. inch is not rounded away. */
export function formatRate(n: number | null | undefined): string {
  return isNum(n) ? rateFormat.format(n) : DASH
}

export function formatPercent(n: number | null | undefined): string {
  return isNum(n) ? `${quantityFormat.format(n)} %` : DASH
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : dateFormat.format(d)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return DASH
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : dateTimeFormat.format(d)
}

/** Sheet size, e.g. 23 × 36. */
export function formatSize(w: number | null | undefined, h: number | null | undefined): string {
  return isNum(w) && isNum(h) ? `${formatQuantity(w)} × ${formatQuantity(h)}` : DASH
}
