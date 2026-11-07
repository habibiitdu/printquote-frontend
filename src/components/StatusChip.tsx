import type { QuotationStatus } from '../api/types'
import { statusLabel } from '../lib/labels'

export function StatusChip({ status, suffix }: { status: QuotationStatus; suffix?: string }) {
  return (
    <span className={`chip chip-${status}`}>
      {statusLabel[status] ?? status}
      {suffix ? ` · ${suffix}` : ''}
    </span>
  )
}
