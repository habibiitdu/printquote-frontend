import { useSetStatus } from '../../api/quotations'
import type { QuotationDetail, QuotationStatus } from '../../api/types'
import { ProblemBanner } from '../../components/ProblemBanner'

const ACTIONS: { status: QuotationStatus; label: string }[] = [
  { status: 'sent', label: 'Mark as sent' },
  { status: 'approved', label: 'Mark approved' },
  { status: 'lost', label: 'Mark lost' },
  { status: 'draft', label: 'Back to draft' },
]

/** Status changes via PUT /quotations/{id}/status. */
export function StatusActions({ quotation }: { quotation: QuotationDetail }) {
  const setStatus = useSetStatus()
  return (
    <>
      {ACTIONS.filter((a) => a.status !== quotation.status).map((a) => (
        <button
          key={a.status}
          type="button"
          className={a.status === 'sent' && quotation.status === 'draft' ? 'btn btn-p' : 'btn btn-s'}
          disabled={setStatus.isPending}
          onClick={() => setStatus.mutate({ id: quotation.id, status: a.status })}
        >
          {a.label}
        </button>
      ))}
      {setStatus.error ? (
        <div style={{ flexBasis: '100%' }}>
          <ProblemBanner error={setStatus.error} heading="Status was not changed" />
        </div>
      ) : null}
    </>
  )
}
