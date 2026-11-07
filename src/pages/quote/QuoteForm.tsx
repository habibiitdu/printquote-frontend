import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAddVersion, useCreateQuotation } from '../../api/quotations'
import type { QuotationDetail } from '../../api/types'
import { TextField } from '../../components/form/Fields'
import { PageHeader } from '../../components/PageHeader'
import { IssueList, ProblemBanner } from '../../components/ProblemBanner'
import {
  buildSpec,
  emptyComponent,
  saveIssues,
  type ComponentDraft,
  type Masters,
  type QuoteDraft,
} from '../../lib/quoteDraft'
import { ComponentEditor } from './ComponentEditor'
import { LiveCostPanel } from './LiveCostPanel'
import { BindingExtrasSection, JobSection, OverheadsSection } from './QuoteSections'

interface Props {
  masters: Masters
  init: () => QuoteDraft
  /** Present when editing: saving creates a new version. */
  quotation?: QuotationDetail
}

const FORM_ID = 'quote-form'

export function QuoteForm({ masters, init, quotation }: Props) {
  const [draft, setDraft] = useState<QuoteDraft>(init)
  const [showIssues, setShowIssues] = useState(false)
  const navigate = useNavigate()
  const create = useCreateQuotation()
  const addVersion = useAddVersion()
  const isEdit = Boolean(quotation)
  const saving = create.isPending || addVersion.isPending
  const saveError = create.error ?? addVersion.error

  const { spec, issues } = useMemo(() => buildSpec(draft, masters), [draft, masters])
  const allIssues = [...saveIssues(draft, isEdit), ...issues]

  const updateComponent = (key: string, fn: (c: ComponentDraft) => ComponentDraft) =>
    setDraft((d) => ({ ...d, components: d.components.map((c) => (c.key === key ? fn(c) : c)) }))
  const removeComponent = (key: string) =>
    setDraft((d) => ({ ...d, components: d.components.filter((c) => c.key !== key) }))
  const addComponent = () =>
    setDraft((d) => ({
      ...d,
      components: [...d.components, emptyComponent(masters, 'forma', `Component ${d.components.length + 1}`)],
    }))

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!spec || allIssues.length > 0) {
      setShowIssues(true)
      return
    }
    const note = draft.note.trim() || null
    const done = (q: QuotationDetail) => navigate(`/quotations/${q.id}`)
    if (quotation) {
      addVersion.mutate({ id: quotation.id, body: { jobName: draft.jobName.trim(), spec, note } }, { onSuccess: done })
    } else {
      create.mutate(
        {
          jobName: draft.jobName.trim(),
          customerId: draft.customerId,
          companyId: draft.companyId,
          templateId: draft.templateId || null,
          spec,
          note,
        },
        { onSuccess: done },
      )
    }
  }

  const saveLabel = saving ? 'Saving…' : isEdit ? 'Save new version' : 'Save quotation'

  return (
    <>
      <PageHeader
        eyebrow={
          quotation ? <Link to={`/quotations/${quotation.id}`}>{quotation.number}</Link> : <Link to="/">Quotations</Link>
        }
        title={quotation ? `Edit ${quotation.number}` : 'New quotation'}
        description={
          quotation
            ? `Saving creates version ${quotation.currentVersion + 1}. Earlier versions keep their prices.`
            : undefined
        }
        actions={
          <button type="submit" form={FORM_ID} className="btn btn-p" disabled={saving}>
            {saveLabel}
          </button>
        }
      />

      <ProblemBanner error={saveError} heading="The quotation was not saved" />
      {showIssues && <IssueList title="Fix these before saving:" issues={allIssues} />}

      <div className="row">
        <form id={FORM_ID} className="col-main" onSubmit={onSubmit} noValidate>
          <JobSection draft={draft} setDraft={setDraft} masters={masters} isEdit={isEdit} saveError={saveError} />

          <section className="card" aria-labelledby="comp-h">
            <div className="card-head">
              <h2 id="comp-h" className="card-title">
                2. Components
              </h2>
              <button type="button" className="btn btn-s" onClick={addComponent}>
                Add component
              </button>
            </div>
            {draft.components.length === 0 && <p className="muted">No components yet. Add one to start.</p>}
            {draft.components.map((c) => (
              <ComponentEditor
                key={c.key}
                component={c}
                masters={masters}
                onChange={(fn) => updateComponent(c.key, fn)}
                onRemove={() => removeComponent(c.key)}
              />
            ))}
            <p className="small muted">
              Fields marked <span className="chip chip-ask">Ask</span> are required by the template. Locked fields are
              fixed for this product.
            </p>
          </section>

          <BindingExtrasSection draft={draft} setDraft={setDraft} masters={masters} />
          <OverheadsSection draft={draft} setDraft={setDraft} />

          <section className="card" aria-labelledby="save-h">
            <h2 id="save-h" className="card-title">
              5. Save
            </h2>
            <TextField
              label={isEdit ? 'Version note (optional)' : 'Note (optional)'}
              value={draft.note}
              onChange={(note) => setDraft((d) => ({ ...d, note }))}
              placeholder={isEdit ? 'e.g. quantity changed to 25,000' : ''}
            />
            <div className="form-actions">
              <button type="submit" className="btn btn-p" disabled={saving}>
                {saveLabel}
              </button>
              <Link className="btn btn-s" to={quotation ? `/quotations/${quotation.id}` : '/'}>
                Cancel
              </Link>
            </div>
          </section>
        </form>

        <LiveCostPanel spec={spec} issues={issues} />
      </div>
    </>
  )
}
