import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Map as MapIcon,
  Plus,
  Send,
  Settings2,
  StickyNote,
  XCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTemplates } from '../api/masterData'
import { useQuotationList } from '../api/quotations'
import type { ProductTemplate, QuotationStatus } from '../api/types'
import { PageHeader } from '../components/PageHeader'
import { QueryState } from '../components/QueryState'
import { formatQuantity } from '../lib/format'
import { STATUSES, statusLabel } from '../lib/labels'
import { QuotationList } from './quotations/QuotationList'

const STATUS_ICON: Record<QuotationStatus, LucideIcon> = {
  draft: FileText,
  sent: Send,
  approved: CheckCircle2,
  lost: XCircle,
}

export function DashboardPage() {
  return (
    <>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        description="Quotations are priced from the rates under Rates & products. Edit a rate once and every new draft picks it up."
        actions={
          <Link className="btn btn-p" to="/quotations/new">
            <Plus size={18} aria-hidden="true" />
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
  const Icon = STATUS_ICON[status]
  return (
    <div className="card kpi">
      <span className={`kpi-icon tone-${status}`} aria-hidden="true">
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <span className="kpi-text">
        <span className="kpi-label">{statusLabel[status]}</span>
        <span className="kpi-value">{q.isError ? '—' : q.data ? formatQuantity(q.data.total) : '…'}</span>
      </span>
    </div>
  )
}

const TILE_TONES = ['tone-cyan', 'tone-magenta', 'tone-yellow', 'tone-primary']

/** Picks an icon that hints at the product: books, maps, single sheets. */
function templateIcon(t: ProductTemplate): LucideIcon {
  const name = t.name.toLowerCase()
  if (name.includes('map')) return MapIcon
  if (t.components.length > 1 || name.includes('book')) return BookOpen
  return StickyNote
}

function TemplateTiles() {
  const templates = useTemplates()
  const active = (templates.data ?? []).filter((t) => t.isActive)
  return (
    <section className="card" aria-labelledby="tpl-heading">
      <div className="card-head">
        <div className="stack-sm">
          <h2 id="tpl-heading" className="card-title">
            Start a quotation from a product
          </h2>
          <p className="card-sub">Each template brings its components, papers and binding pre-filled.</p>
        </div>
      </div>
      <QueryState isLoading={templates.isLoading} error={templates.error}>
        <div className="tiles">
          {active.map((t, i) => {
            const Icon = templateIcon(t)
            return (
              <Link key={t.id} className="tile" to={`/quotations/new?template=${t.id}`}>
                <span className={`tile-icon ${TILE_TONES[i % TILE_TONES.length]}`} aria-hidden="true">
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <span className="tile-title">{t.name}</span>
                <span className="tile-desc">{t.description || `${t.components.length} components`}</span>
                <ArrowRight className="tile-go" size={18} aria-hidden="true" />
              </Link>
            )
          })}
          <Link className="tile tile-dashed" to="/settings/templates">
            <span className="tile-icon tone-draft" aria-hidden="true">
              <Settings2 size={20} strokeWidth={1.9} />
            </span>
            <span className="tile-title">Manage templates</span>
            <span className="tile-desc">Add a new product type without code</span>
            <ArrowRight className="tile-go" size={18} aria-hidden="true" />
          </Link>
        </div>
      </QueryState>
    </section>
  )
}
