import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface Props {
  title: ReactNode
  eyebrow?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  icon?: LucideIcon
}

export function PageHeader({ title, eyebrow, description, actions, icon: Icon }: Props) {
  return (
    <div className="page-head">
      <div className="page-head-main">
        {Icon && (
          <span className="page-icon no-print" aria-hidden="true">
            <Icon size={22} strokeWidth={1.9} />
          </span>
        )}
        <div className="page-head-text">
          {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-desc">{description}</p>}
        </div>
      </div>
      {actions && <div className="actions no-print">{actions}</div>}
    </div>
  )
}
