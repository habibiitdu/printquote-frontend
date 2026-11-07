import type { ReactNode } from 'react'
import { ProblemBanner } from './ProblemBanner'

interface Props {
  isLoading: boolean
  error: unknown
  children: ReactNode
  label?: string
}

/** Shows a loading placeholder or an error banner until the data is ready. */
export function QueryState({ isLoading, error, children, label = 'Loading…' }: Props) {
  if (error) return <ProblemBanner error={error} />
  if (isLoading)
    return (
      <div className="skeleton" role="status" aria-label={label}>
        <span />
        <span />
        <span />
      </div>
    )
  return <>{children}</>
}
