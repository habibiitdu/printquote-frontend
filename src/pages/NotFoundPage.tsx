import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Page not found" description="There is nothing at this address." />
      <p>
        <Link to="/">Back to the dashboard</Link>
      </p>
    </>
  )
}
