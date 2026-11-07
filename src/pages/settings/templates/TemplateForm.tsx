import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../../api/client'
import { useBindingTypes, useFinishingOperations, usePapers, usePresses } from '../../../api/masterData'
import type { ProductTemplate, ProductTemplateInput } from '../../../api/types'
import { FormActions, type EntityFormProps } from '../../../components/CrudSection'
import { CheckboxField, NumberField, SelectField, TextAreaField, TextField } from '../../../components/form/Fields'
import { ProblemBanner } from '../../../components/ProblemBanner'
import { basisLabel } from '../../../lib/labels'
import { TemplateComponentEditor, type TemplateRefs } from './TemplateComponentEditor'
import {
  newTemplateComponent,
  toTemplateDraft,
  toTemplateInput,
  type TemplateComponentDraft,
  type TemplateDraft,
} from './templateDraft'

export function TemplateForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<ProductTemplate, ProductTemplateInput>) {
  const [d, setD] = useState<TemplateDraft>(() => toTemplateDraft(initial))
  const papers = usePapers()
  const presses = usePresses()
  const finishingOps = useFinishingOperations()
  const bindingTypes = useBindingTypes()
  const refs: TemplateRefs = {
    papers: papers.data ?? [],
    presses: presses.data ?? [],
    finishingOps: finishingOps.data ?? [],
  }
  const set = (patch: Partial<TemplateDraft>) => setD((x) => ({ ...x, ...patch }))
  const setComponent = (key: string, fn: (c: TemplateComponentDraft) => TemplateComponentDraft) =>
    setD((x) => ({ ...x, components: x.components.map((c) => (c.key === key ? fn(c) : c)) }))
  const err = (f: string) => fieldErrors(error, f)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(toTemplateInput(d))
  }

  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Template not saved" />
      <div className="grid2">
        <TextField label="Name" value={d.name} onChange={(name) => set({ name })} required errors={err('name')} />
        <SelectField
          label="Default binding"
          value={d.defaultBindingTypeId}
          onChange={(defaultBindingTypeId) => set({ defaultBindingTypeId })}
          options={(bindingTypes.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
          placeholder="None"
          errors={err('defaultBindingTypeId')}
        />
        <NumberField label="Default page width (in)" value={d.defaultPageWidthIn} onChange={(v) => set({ defaultPageWidthIn: v })} min={0} errors={err('defaultPageWidthIn')} />
        <NumberField label="Default page height (in)" value={d.defaultPageHeightIn} onChange={(v) => set({ defaultPageHeightIn: v })} min={0} errors={err('defaultPageHeightIn')} />
        <NumberField label="Profit % (blank = rules)" value={d.profitPercent} onChange={(v) => set({ profitPercent: v })} min={0} errors={err('profitPercent')} />
        <CheckboxField label="Active" checked={d.isActive} onChange={(isActive) => set({ isActive })} />
      </div>
      <TextAreaField label="Description" value={d.description} onChange={(description) => set({ description })} rows={2} errors={err('description')} />

      <div className="card-head">
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>Components</h3>
        <button
          type="button"
          className="btn btn-s btn-sm"
          onClick={() => setD((x) => ({ ...x, components: [...x.components, newTemplateComponent(x.components.length + 1)] }))}
        >
          Add component
        </button>
      </div>
      {err('components').length > 0 && <p className="err">{err('components').join(' ')}</p>}
      {d.components.length === 0 && <p className="small muted">No components yet.</p>}
      {d.components.map((c, i) => (
        <TemplateComponentEditor
          key={c.key}
          component={c}
          index={i}
          refs={refs}
          onChange={(fn) => setComponent(c.key, fn)}
          onRemove={() => setD((x) => ({ ...x, components: x.components.filter((y) => y.key !== c.key) }))}
        />
      ))}

      <fieldset className="fieldset stack-sm">
        <legend>Job extras</legend>
        {d.extras.map((x, i) => (
          <div key={i} className="grid2" style={{ alignItems: 'end' }}>
            <SelectField
              label={`Extra ${i + 1}`}
              value={x.finishingOperationId}
              onChange={(finishingOperationId) =>
                setD((t) => ({ ...t, extras: t.extras.map((e, j) => (j === i ? { ...e, finishingOperationId } : e)) }))
              }
              options={refs.finishingOps
                .filter((o) => o.isActive || o.id === x.finishingOperationId)
                .map((o) => ({ value: o.id, label: `${o.name} (${basisLabel[o.basis]})` }))}
              placeholder="Choose…"
            />
            <NumberField
              label="Default amount"
              value={x.defaultAmount}
              onChange={(defaultAmount) =>
                setD((t) => ({ ...t, extras: t.extras.map((e, j) => (j === i ? { ...e, defaultAmount } : e)) }))
              }
              min={0}
              placeholder="Configured rate"
              hint="Fixed-basis operations only."
            />
            <div>
              <button
                type="button"
                className="btn btn-g"
                onClick={() => setD((t) => ({ ...t, extras: t.extras.filter((_, j) => j !== i) }))}
                aria-label={`Remove extra ${i + 1}`}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        <div>
          <button
            type="button"
            className="btn btn-s btn-sm"
            onClick={() => setD((t) => ({ ...t, extras: [...t.extras, { finishingOperationId: '', defaultAmount: '' }] }))}
          >
            Add extra
          </button>
        </div>
      </fieldset>

      <div className="note-box">
        <strong>Ask</strong> = the person quoting must enter it before the quote can be calculated. <strong>Default</strong> =
        filled in, can be changed. <strong>Locked</strong> = fixed for this product.
      </div>
      <FormActions saving={saving} onCancel={onCancel} label="Save template" />
    </form>
  )
}
