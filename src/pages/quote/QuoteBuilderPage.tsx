import { useParams, useSearchParams } from 'react-router-dom'
import { useQuotation } from '../../api/quotations'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { draftFromSpec, newDraft } from '../../lib/quoteDraft'
import { QuoteForm } from './QuoteForm'
import { useMasters } from './useMasters'

/** /quotations/new?template={id} and /quotations/{id}/edit. */
export function QuoteBuilderPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const templateParam = params.get('template') ?? ''
  const masters = useMasters()
  const quotation = useQuotation(id)

  const isEdit = Boolean(id)
  const loading = masters.isLoading || (isEdit && quotation.isLoading)
  const error = masters.error ?? (isEdit ? quotation.error : null)
  const m = masters.data
  const q = quotation.data

  return (
    <QueryState isLoading={loading || !m || (isEdit && !q)} error={error} label="Loading rates and templates…">
      {m && !isEdit && (
        <QuoteForm
          key={`new-${templateParam}`}
          masters={m}
          init={() => newDraft(m, m.templates.find((t) => t.id === templateParam))}
        />
      )}
      {m && isEdit && q && q.versions.length > 0 && (
        <QuoteForm
          key={`edit-${q.id}-${q.currentVersion}`}
          masters={m}
          quotation={q}
          init={() => draftFromSpec(q.versions[0].spec, q, m.templates.find((t) => t.id === q.templateId))}
        />
      )}
      {m && isEdit && q && q.versions.length === 0 && (
        <PageHeader title="Cannot edit" description="This quotation has no saved version to start from." />
      )}
    </QueryState>
  )
}
