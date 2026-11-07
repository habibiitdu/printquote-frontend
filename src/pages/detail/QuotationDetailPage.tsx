import { FileText } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCustomers } from '../../api/masterData'
import { useQuotation } from '../../api/quotations'
import type { QuotationDetail } from '../../api/types'
import { WarningList } from '../../components/costsheet/CostNotes'
import { CustomerQuotation, InternalCostSheet } from '../../components/costsheet/QuotationDocuments'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { StatusChip } from '../../components/StatusChip'
import { BreaksPanel } from './BreaksPanel'
import { StatusActions } from './StatusActions'
import { VersionHistory } from './VersionHistory'

export function QuotationDetailPage() {
  const { id } = useParams()
  const q = useQuotation(id)
  return (
    <QueryState isLoading={q.isLoading} error={q.error} label="Loading quotation…">
      {q.data && <QuotationView quotation={q.data} />}
    </QueryState>
  )
}

type View = 'internal' | 'customer'

function QuotationView({ quotation }: { quotation: QuotationDetail }) {
  const [view, setView] = useState<View>('internal')
  const [versionNo, setVersionNo] = useState<number | null>(null)
  const customers = useCustomers()

  const shownNo = versionNo ?? quotation.currentVersion
  const version = quotation.versions.find((v) => v.versionNumber === shownNo) ?? quotation.versions[0]
  const customer = customers.data?.find((c) => c.id === quotation.customerId)
  const party = {
    companyName: quotation.companyName,
    customerName: quotation.customerName,
    customerAddress: customer?.address,
    jobName: quotation.jobName,
  }
  const isOld = version && version.versionNumber !== quotation.currentVersion

  return (
    <>
      <PageHeader
        icon={FileText}
        eyebrow={<Link to="/quotations">Quotations</Link>}
        title={
          <span className="inline-pair" style={{ flexWrap: 'wrap', gap: 12 }}>
            <span>
              {quotation.number} · {quotation.jobName}
            </span>
            <StatusChip status={quotation.status} suffix={`version ${quotation.currentVersion}`} />
          </span>
        }
        actions={
          <>
            <Link className="btn btn-s" to={`/quotations/${quotation.id}/edit`}>
              Edit
            </Link>
            <button type="button" className="btn btn-s" onClick={() => window.print()}>
              Print
            </button>
            <StatusActions quotation={quotation} />
          </>
        }
      />

      <div className="row">
        <section className="card col-main" aria-label="Quotation document">
          <div className="card-head no-print">
            <div className="seg" role="group" aria-label="Document view">
              <button type="button" aria-pressed={view === 'internal'} onClick={() => setView('internal')}>
                Internal cost sheet
              </button>
              <button type="button" aria-pressed={view === 'customer'} onClick={() => setView('customer')}>
                Customer quotation
              </button>
            </div>
            <span className="small muted">
              Version {version?.versionNumber ?? '—'}
              {quotation.templateName ? ` · ${quotation.templateName}` : ''}
            </span>
          </div>

          {isOld && (
            <div className="banner banner-info no-print" role="status">
              You are viewing version {version.versionNumber}. The current version is {quotation.currentVersion}.{' '}
              <button type="button" className="btn-g" onClick={() => setVersionNo(null)}>
                Show current
              </button>
            </div>
          )}

          {!version ? (
            <p className="muted">This quotation has no saved version.</p>
          ) : view === 'internal' ? (
            <>
              <InternalCostSheet party={party} sheet={version.costSheet} />
              <div className="no-print">
                <WarningList warnings={version.costSheet.warnings} />
              </div>
            </>
          ) : (
            <CustomerQuotation party={party} sheet={version.costSheet} />
          )}
        </section>

        <aside className="col-side no-print" aria-label="Quotation tools">
          <BreaksPanel quotationId={quotation.id} version={quotation.currentVersion} quantity={quotation.quantity} />
          <VersionHistory quotation={quotation} selected={shownNo} onSelect={setVersionNo} />
        </aside>
      </div>
    </>
  )
}
