import { isApiError } from '../api/client'

interface Props {
  error: unknown
  /** Shown above the server's own title. */
  heading?: string
}

/** Shows an API ProblemDetails (title, detail and every validation message) or any other error. */
export function ProblemBanner({ error, heading }: Props) {
  if (!error) return null
  let title = 'Something went wrong'
  let detail: string | undefined
  let messages: string[] = []
  if (isApiError(error)) {
    title = error.problem.title ?? title
    detail = error.problem.detail
    messages = error.messages
  } else if (error instanceof Error) {
    detail = error.message
  }
  return (
    <div className="banner banner-error" role="alert">
      {heading && <p className="banner-title">{heading}</p>}
      <p className={heading ? '' : 'banner-title'}>{title}</p>
      {detail && detail !== title && <p>{detail}</p>}
      {messages.length > 0 && (
        <ul>
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function IssueList({ title, issues }: { title: string; issues: string[] }) {
  if (issues.length === 0) return null
  return (
    <div className="banner banner-warn" role="status">
      <p className="banner-title">{title}</p>
      <ul>
        {issues.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  )
}
