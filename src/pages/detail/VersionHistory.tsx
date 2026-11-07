import type { QuotationDetail } from '../../api/types'
import { formatDateTime, formatMoney, formatQuantity } from '../../lib/format'

interface Props {
  quotation: QuotationDetail
  selected: number
  onSelect: (versionNumber: number) => void
}

/** Versions newest first; choosing one shows its cost sheet. */
export function VersionHistory({ quotation, selected, onSelect }: Props) {
  return (
    <section className="card" aria-labelledby="hist-h">
      <h2 id="hist-h" className="card-title">
        Version history
      </h2>
      <div className="stack-sm">
        {quotation.versions.map((v) => (
          <button
            key={v.versionNumber}
            type="button"
            className="version-btn"
            aria-pressed={v.versionNumber === selected}
            onClick={() => onSelect(v.versionNumber)}
          >
            <span style={{ fontWeight: 600 }}>
              Version {v.versionNumber}
              {v.versionNumber === quotation.currentVersion ? ' (current)' : ''}
              {v.note ? `: ${v.note}` : ''}
            </span>
            <span className="muted">
              {formatDateTime(v.createdAt)} · {formatQuantity(v.costSheet.quantity)} pcs · bill{' '}
              {formatMoney(v.costSheet.totalBill)}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
