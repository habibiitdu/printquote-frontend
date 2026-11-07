import { Link } from 'react-router-dom'
import { useTemplates } from '../api/masterData'
import { useQuotationList } from '../api/quotations'
import type { QuotationStatus } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { QueryState } from '../components/QueryState'
import { formatQuantity } from '../lib/format'
import { STATUSES, statusLabel } from '../lib/labels'
import { QuotationList } from './quotations/QuotationList'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Quotations"
        description="Every quotation is priced from the rate masters under Configuration. Edit a rate once and every new draft picks it up."
        actions={
          <Link className="btn btn-p" to="/quotations/new">
            New quotation
          </Link>
        }
      />
      <div className="kpis">
        {STATUSES.map((s) => (
          <StatusCount key={s} status={s} />
        ))}
      </div>
      <TemplateTiles />
      <QuotationList />
    </>
  )
}

/** The contract has no counts endpoint, so each count is a one-row list request reading `total`. */
function StatusCount({ status }: { status: QuotationStatus }) {
  const q = useQuotationList({ status, page: 1, pageSize: 1 })
  return (
    <div className="card kpi">
      <span className="kpi-label">{statusLabel[status]}</span>
      <span className="kpi-value">{q.isError ? '—' : q.data ? formatQuantity(q.data.total) : '…'}</span>
    </div>
  )
}

function TemplateTiles() {
  const templates = useTemplates()
  const active = (templates.data ?? []).filter((t) => t.isActive)
  return (
    <section className="card" aria-labelledby="tpl-heading">
      <h2 id="tpl-heading" className="card-title">
        Start from a product template
      </h2>
      <QueryState isLoading={templates.isLoading} error={templates.error}>
        <div className="tiles">
          {active.map((t) => (
            <Link key={t.id} className="tile" to={`/quotations/new?template=${t.id}`}>
              <span className="tile-title">{t.name}</span>
              <span className="tile-desc">{t.description || `${t.components.length} components`}</span>
            </Link>
          ))}
          <Link className="tile" to="/settings/templates">
            <span className="tile-title">Manage templates</span>
            <span className="tile-desc">Add a new product type without code</span>
          </Link>
        </div>
      </QueryState>
    </section>
  )
}
