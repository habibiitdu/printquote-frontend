import { LayoutTemplate } from 'lucide-react'
import { templatesApi } from '../../../api/masterData'
import { CrudSection } from '../../../components/CrudSection'
import { PageHeader } from '../../../components/PageHeader'
import { formatPercent } from '../../../lib/format'
import { TemplateForm } from './TemplateForm'

export function TemplatesPage() {
  return (
    <>
      <PageHeader
        icon={LayoutTemplate}
        eyebrow="Configuration"
        title="Product templates"
        description="A template says which components a product has and, for each field, whether the quote form asks for it, fills a default, or locks it. New product types are added here, not in code."
      />
      <CrudSection
        resource={templatesApi}
        title="Templates"
        noun="template"
        wide
        columns={[
          { header: 'Description', cell: (t) => t.description },
          { header: 'Components', cell: (t) => t.components.map((c) => c.name).join(', ') || '—' },
          { header: 'Profit', num: true, cell: (t) => (t.profitPercent == null ? 'By rule' : formatPercent(t.profitPercent)) },
        ]}
        Form={TemplateForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
    </>
  )
}
