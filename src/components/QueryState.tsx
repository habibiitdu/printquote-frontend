import type { ReactNode } from 'react'
import { ProblemBanner } from './ProblemBanner'

interface Props {
  isLoading: boolean
  error: unknown
  children: ReactNode
  label?: string
}

/** Shows a loading line or an error banner until the data is ready. */
export function QueryState({ isLoading, error, children, label = 'Loading…' }: Props) {
  if (error) return <ProblemBanner error={error} />
  if (isLoading)
    return (
      <p className="muted" role="status">
        {label}
      </p>
    )
  return <>{children}</>
}
