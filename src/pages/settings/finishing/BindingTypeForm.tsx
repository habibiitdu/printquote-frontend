import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../../api/client'
import type { BindingType, BindingTypeInput } from '../../../api/types'
import { FormActions, type EntityFormProps } from '../../../components/CrudSection'
import { CheckboxField, TextField } from '../../../components/form/Fields'
import { ProblemBanner } from '../../../components/ProblemBanner'
import { requiredNumber, toInput, toNumber } from '../../../lib/numbers'

interface SlabDraft {
  upTo: string
  rate: string
}

export function BindingTypeForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<BindingType, BindingTypeInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [slabs, setSlabs] = useState<SlabDraft[]>(
    (initial?.slabs ?? []).map((s) => ({ upTo: toInput(s.upToForma), rate: toInput(s.ratePerPiece) })),
  )
  const set = (i: number, patch: Partial<SlabDraft>) => setSlabs((xs) => xs.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  const slabErrors = fieldErrors(error, 'slabs')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      isActive,
      slabs: slabs.map((s) => ({ upToForma: toNumber(s.upTo), ratePerPiece: requiredNumber(s.rate) })),
    })
  }

  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={fieldErrors(error, 'name')} />
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <fieldset className="fieldset stack">
        <legend>Rate slabs</legend>
        {slabErrors.length > 0 && <p className="err">{slabErrors.join(' ')}</p>}
        <div className="scroll-x">
          <table className="tbl slab-table">
            <thead>
              <tr>
                <th scope="col">Up to forma</th>
                <th scope="col">Rate per copy</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {slabs.map((s, i) => (
                <tr key={i}>
                  <td>
                    <label className="sr-only" htmlFor={`bslab-up-${i}`}>
                      Slab {i + 1} up to forma
                    </label>
                    <input id={`bslab-up-${i}`} className="in" type="number" min={0} step="any" placeholder="and above" value={s.upTo} onChange={(e) => set(i, { upTo: e.target.value })} />
                  </td>
                  <td>
                    <label className="sr-only" htmlFor={`bslab-rate-${i}`}>
                      Slab {i + 1} rate per copy
                    </label>
                    <input id={`bslab-rate-${i}`} className="in" type="number" min={0} step="any" required value={s.rate} onChange={(e) => set(i, { rate: e.target.value })} />
                  </td>
                  <td>
                    <button type="button" className="btn btn-g" onClick={() => setSlabs((xs) => xs.filter((_, j) => j !== i))} aria-label={`Remove slab ${i + 1}`}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">Leave “up to” blank for “and above”. A single blank slab gives one flat rate.</p>
        <div>
          <button type="button" className="btn btn-s btn-sm" onClick={() => setSlabs((xs) => [...xs, { upTo: '', rate: '' }])}>
            Add slab
          </button>
        </div>
      </fieldset>
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
