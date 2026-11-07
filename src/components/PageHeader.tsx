import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, eyebrow, description, actions }: Props) {
  return (
    <div className="page-head">
      <div className="page-head-text">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="actions no-print">{actions}</div>}
    </div>
  )
}
