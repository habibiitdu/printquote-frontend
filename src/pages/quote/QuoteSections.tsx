import { fieldErrors } from '../../api/client'
import { CheckboxField, NumberField, SelectField, TextField } from '../../components/form/Fields'
import { basisLabel } from '../../lib/labels'
import { applyTemplate, type Masters, type QuoteDraft } from '../../lib/quoteDraft'

interface SectionProps {
  draft: QuoteDraft
  setDraft: (fn: (d: QuoteDraft) => QuoteDraft) => void
  masters: Masters
}

const active = <T extends { isActive: boolean; id: string }>(rows: T[], keep: string) =>
  rows.filter((r) => r.isActive || r.id === keep)

export function JobSection({ draft, setDraft, masters, isEdit, saveError }: SectionProps & { isEdit: boolean; saveError: unknown }) {
  const set = (patch: Partial<QuoteDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const hasForma = draft.components.some((c) => c.measure === 'forma')
  const lockedHint = isEdit ? 'Fixed once the quotation is created.' : undefined

  return (
    <section className="card" aria-labelledby="job-h">
      <h2 id="job-h" className="card-title">
        1. Job
      </h2>
      <div className="grid2">
        <SelectField
          label="Letterhead"
          value={draft.companyId}
          onChange={(companyId) => set({ companyId })}
          options={active(masters.companies, draft.companyId).map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Choose a letterhead"
          required
          disabled={isEdit}
          hint={lockedHint}
          errors={fieldErrors(saveError, 'companyId')}
        />
        <SelectField
          label="Customer"
          value={draft.customerId}
          onChange={(customerId) => set({ customerId })}
          options={active(masters.customers, draft.customerId).map((c) => ({ value: c.id, label: c.name }))}
          placeholder="Choose a customer"
          required
          ask
          disabled={isEdit}
          hint={lockedHint}
          errors={fieldErrors(saveError, 'customerId')}
        />
        <TextField
          label="Job name"
          value={draft.jobName}
          onChange={(jobName) => set({ jobName })}
          required
          ask
          errors={fieldErrors(saveError, 'jobName')}
        />
        <SelectField
          label="Product template"
          value={draft.templateId}
          onChange={(id) => setDraft((d) => applyTemplate(d, masters.templates.find((t) => t.id === id), masters))}
          options={active(masters.templates, draft.templateId).map((t) => ({ value: t.id, label: t.name }))}
          placeholder="No template (build by hand)"
          disabled={isEdit}
          hint={isEdit ? lockedHint : 'Changing the template rebuilds the components.'}
        />
        <NumberField
          label="Quantity (pcs)"
          value={draft.quantity}
          onChange={(quantity) => set({ quantity })}
          min={1}
          step={1}
          required
          ask
          errors={fieldErrors(saveError, 'quantity')}
        />
        {hasForma && (
          <fieldset className="fieldset">
            <legend>Finished page size (in)</legend>
            <div className="inline-pair">
              <NumberField
                label="Page width (in)"
                hideLabel
                value={draft.pageWidthIn}
                onChange={(pageWidthIn) => set({ pageWidthIn })}
                min={0}
                step={0.25}
                placeholder="W"
              />
              <span aria-hidden="true">×</span>
              <NumberField
                label="Page height (in)"
                hideLabel
                value={draft.pageHeightIn}
                onChange={(pageHeightIn) => set({ pageHeightIn })}
                min={0}
                step={0.25}
                placeholder="H"
              />
            </div>
          </fieldset>
        )}
      </div>
    </section>
  )
}

export function BindingExtrasSection({ draft, setDraft, masters }: SectionProps) {
  const opName = (id: string) => masters.finishingOps.find((o) => o.id === id)
  const available = masters.finishingOps.filter(
    (o) => o.isActive && !draft.extras.some((x) => x.finishingOperationId === o.id),
  )
  const setExtra = (i: number, patch: Partial<QuoteDraft['extras'][number]>) =>
    setDraft((d) => ({ ...d, extras: d.extras.map((x, j) => (j === i ? { ...x, ...patch } : x)) }))

  return (
    <section className="card" aria-labelledby="bind-h">
      <h2 id="bind-h" className="card-title">
        3. Binding, packing &amp; delivery
      </h2>
      <div className="grid2">
        <SelectField
          label="Binding"
          value={draft.bindingTypeId}
          onChange={(bindingTypeId) => setDraft((d) => ({ ...d, bindingTypeId }))}
          options={active(masters.bindingTypes, draft.bindingTypeId).map((b) => ({ value: b.id, label: b.name }))}
          placeholder="None (cut & pack)"
        />
      </div>

      {draft.extras.length > 0 && (
        <div className="stack">
          {draft.extras.map((x, i) => {
            const op = opName(x.finishingOperationId)
            const fixed = op?.basis === 'fixed'
            return (
              <div key={x.finishingOperationId} className="grid2" style={{ alignItems: 'end' }}>
                <CheckboxField
                  label={
                    <>
                      {op?.name ?? 'Unknown operation'}{' '}
                      {op && <span className="chip">{basisLabel[op.basis]}</span>}
                    </>
                  }
                  checked={x.included}
                  onChange={(included) => setExtra(i, { included })}
                />
                {fixed && (
                  <NumberField
                    label={`${op?.name ?? 'Amount'} (amount)`}
                    value={x.amount}
                    onChange={(amount) => setExtra(i, { amount })}
                    min={0}
                    step={1}
                    placeholder={`Rate ${op?.rate ?? ''}`}
                    hint="Blank = configured rate."
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {available.length > 0 && (
        <SelectField
          label="Add a job extra"
          value=""
          onChange={(id) =>
            id &&
            setDraft((d) => ({ ...d, extras: [...d.extras, { finishingOperationId: id, included: true, amount: '' }] }))
          }
          options={available.map((o) => ({ value: o.id, label: `${o.name} (${basisLabel[o.basis]})` }))}
          placeholder="Choose an operation to add…"
        />
      )}
    </section>
  )
}

export function OverheadsSection({ draft, setDraft }: Omit<SectionProps, 'masters'>) {
  const set = (patch: Partial<QuoteDraft>) => setDraft((d) => ({ ...d, ...patch }))
  return (
    <section className="card" aria-labelledby="ovh-h">
      <h2 id="ovh-h" className="card-title">
        4. Overheads &amp; profit
      </h2>
      <div className="grid2">
        <NumberField label="Sales commission %" value={draft.commissionPercent} onChange={(v) => set({ commissionPercent: v })} min={0} step="any" />
        <NumberField label="Salary, wages & overhead %" value={draft.overheadPercent} onChange={(v) => set({ overheadPercent: v })} min={0} step="any" />
        <NumberField label="Marketing & sales %" value={draft.marketingPercent} onChange={(v) => set({ marketingPercent: v })} min={0} step="any" />
        <NumberField
          label="Profit % (blank = rule)"
          value={draft.profitPercentOverride}
          onChange={(v) => set({ profitPercentOverride: v })}
          step="any"
          placeholder="Rule"
        />
      </div>
    </section>
  )
}
