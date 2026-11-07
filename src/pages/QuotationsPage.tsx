import { Files } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { QuotationList } from './quotations/QuotationList'

export function QuotationsPage() {
  return (
    <>
      <PageHeader
        icon={Files}
        title="Quotations"
        actions={
          <Link className="btn btn-p" to="/quotations/new">
            New quotation
          </Link>
        }
      />
      <QuotationList title="All quotations" />
    </>
  )
}
