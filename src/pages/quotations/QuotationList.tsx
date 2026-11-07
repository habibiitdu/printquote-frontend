import { FileSearch } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuotationList } from '../../api/quotations'
import type { QuotationStatus } from '../../api/types'
import { QueryState } from '../../components/QueryState'
import { StatusChip } from '../../components/StatusChip'
import { formatDate, formatMoney, formatQuantity } from '../../lib/format'
import { STATUSES, statusLabel } from '../../lib/labels'
import { useDebouncedValue } from '../../lib/useDebouncedValue'

const PAGE_SIZE = 20

/** Quotation list with status filter pills, search and pagination. */
export function QuotationList({ title = 'Recent quotations' }: { title?: string }) {
  const [status, setStatus] = useState<QuotationStatus | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const query = useQuotationList({ status, search: debouncedSearch || undefined, page, pageSize: PAGE_SIZE })
  const data = query.data
  const pages = data ? Math.max(1, Math.ceil(data.total / (data.pageSize || PAGE_SIZE))) : 1

  const pickStatus = (s: QuotationStatus | undefined) => {
    setStatus(s)
    setPage(1)
  }

  return (
    <section className="card flush" aria-label={title}>
      <div className="card-head">
        <h2 className="card-title">{title}</h2>
        <div className="actions" role="group" aria-label="Filter by status">
          <button type="button" className={`pill ${status === undefined ? 'on' : ''}`} aria-pressed={status === undefined} onClick={() => pickStatus(undefined)}>
            All
          </button>
          {STATUSES.map((s) => (
            <button key={s} type="button" className={`pill ${status === s ? 'on' : ''}`} aria-pressed={status === s} onClick={() => pickStatus(s)}>
              {statusLabel[s]}
            </button>
          ))}
          <label htmlFor="quote-search" className="sr-only">
            Search quotations
          </label>
          <input
            id="quote-search"
            className="in"
            style={{ width: 240, maxWidth: '100%' }}
            type="search"
            placeholder="Search job, customer or number"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
      </div>

      <QueryState isLoading={query.isLoading} error={query.error}>
        {data && data.items.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <FileSearch size={26} strokeWidth={1.8} />
            </span>
            {status || debouncedSearch ? (
              <>
                <p className="empty-state-title">No quotations match</p>
                <p>Try another status or search term.</p>
              </>
            ) : (
              <>
                <p className="empty-state-title">No quotations yet</p>
                <p>Start one from a product template and it will appear here.</p>
                <Link className="btn btn-p" to="/quotations/new">
                  New quotation
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="scroll-x">
            <table className="tbl">
              <thead>
                <tr>
                  <th scope="col">Quote</th>
                  <th scope="col">Job</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Letterhead</th>
                  <th scope="col" className="num">
                    Qty
                  </th>
                  <th scope="col" className="num">
                    Rate / pc
                  </th>
                  <th scope="col" className="num">
                    Total bill
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data?.items.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <Link to={`/quotations/${q.id}`} style={{ fontWeight: 600 }}>
                        {q.number}
                      </Link>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{q.jobName}</div>
                      {q.templateName && <div className="small muted">{q.templateName}</div>}
                    </td>
                    <td>{q.customerName}</td>
                    <td>{q.companyName}</td>
                    <td className="num">{formatQuantity(q.quantity)}</td>
                    <td className="num">{formatMoney(q.ratePerPiece)}</td>
                    <td className="num">{formatMoney(q.totalBill)}</td>
                    <td>
                      <StatusChip status={q.status} />
                    </td>
                    <td>{formatDate(q.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </QueryState>

      {data && data.total > 0 && (
        <nav className="pager" aria-label="Pagination">
          <span className="small muted">
            Page {page} of {pages} · {formatQuantity(data.total)} quotations
          </span>
          <button type="button" className="btn btn-s btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <button type="button" className="btn btn-s btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </nav>
      )}
    </section>
  )
}
