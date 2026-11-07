import { Trash2 } from 'lucide-react'
import { Printer } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../api/client'
import { pressesApi } from '../../api/masterData'
import type { Press, PressChargeType, PressInput } from '../../api/types'
import { CrudSection, FormActions, type EntityFormProps } from '../../components/CrudSection'
import { CheckboxField, NumberField, TextField } from '../../components/form/Fields'
import { PageHeader } from '../../components/PageHeader'
import { ProblemBanner } from '../../components/ProblemBanner'
import { formatMoney, formatQuantity, formatSize } from '../../lib/format'
import { chargeTypeLabel } from '../../lib/labels'
import { requiredNumber, toInput, toNumber } from '../../lib/numbers'
import { findPressSlab } from '../../lib/rates'

export function PressesPage() {
  return (
    <>
      <PageHeader
        icon={Printer}
        eyebrow="Configuration"
        title="Presses & print rates"
        description="Each press has a sheet size, a plate price, make-ready waste and a print rate table. Short runs pay a flat charge per plate; longer runs pay per 1,000 impressions."
      />
      <CrudSection
        resource={pressesApi}
        title="Presses"
        noun="press"
        columns={[
          { header: 'Sheet (in)', cell: (p) => formatSize(p.sheetWidthIn, p.sheetHeightIn) },
          { header: 'Per parent sheet', num: true, cell: (p) => p.piecesPerParentSheet },
          { header: 'Plate price', num: true, cell: (p) => formatMoney(p.platePrice) },
          { header: 'Make-ready / plate', num: true, cell: (p) => p.makeReadySheetsPerPlate },
          { header: 'Forma / plate', num: true, cell: (p) => formatQuantity(p.formaPerPlate) },
          { header: 'Slabs', num: true, cell: (p) => p.rateSlabs.length },
        ]}
        Form={PressForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
    </>
  )
}

interface SlabDraft {
  upTo: string
  chargeType: PressChargeType
  rate: string
}

function PressForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<Press, PressInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [width, setWidth] = useState(toInput(initial?.sheetWidthIn))
  const [height, setHeight] = useState(toInput(initial?.sheetHeightIn))
  const [pieces, setPieces] = useState(toInput(initial?.piecesPerParentSheet ?? 1))
  const [plate, setPlate] = useState(toInput(initial?.platePrice))
  const [makeReady, setMakeReady] = useState(toInput(initial?.makeReadySheetsPerPlate ?? 0))
  const [formaPerPlate, setFormaPerPlate] = useState(toInput(initial?.formaPerPlate ?? 1))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [slabs, setSlabs] = useState<SlabDraft[]>(
    (initial?.rateSlabs ?? []).map((s) => ({
      upTo: toInput(s.upToImpressionsPerPlate),
      chargeType: s.chargeType,
      rate: toInput(s.rate),
    })),
  )
  const err = (f: string) => fieldErrors(error, f)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      sheetWidthIn: requiredNumber(width),
      sheetHeightIn: requiredNumber(height),
      piecesPerParentSheet: requiredNumber(pieces),
      platePrice: requiredNumber(plate),
      makeReadySheetsPerPlate: requiredNumber(makeReady),
      formaPerPlate: requiredNumber(formaPerPlate),
      isActive,
      rateSlabs: slabs.map((s) => ({
        upToImpressionsPerPlate: toNumber(s.upTo),
        chargeType: s.chargeType,
        rate: requiredNumber(s.rate),
      })),
    })
  }

  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={err('name')} placeholder="e.g. Demy" />
      <div className="grid2">
        <NumberField label="Sheet width (in)" value={width} onChange={setWidth} min={0} required errors={err('sheetWidthIn')} />
        <NumberField label="Sheet height (in)" value={height} onChange={setHeight} min={0} required errors={err('sheetHeightIn')} />
        <NumberField label="Press sheets per parent sheet" value={pieces} onChange={setPieces} min={1} step={1} required errors={err('piecesPerParentSheet')} />
        <NumberField label="Plate price" value={plate} onChange={setPlate} min={0} required errors={err('platePrice')} />
        <NumberField
          label="Make-ready waste (sheets per plate)"
          value={makeReady}
          onChange={setMakeReady}
          min={0}
          step={1}
          required
          errors={err('makeReadySheetsPerPlate')}
        />
        <NumberField label="Forma per plate" value={formaPerPlate} onChange={setFormaPerPlate} min={0} step={0.125} required errors={err('formaPerPlate')} hint="Demy 0.5, Double Demy 1." />
      </div>
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <PressSlabEditor slabs={slabs} onChange={setSlabs} errors={err('rateSlabs')} />
      <TryIt slabs={slabs} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}

function PressSlabEditor({
  slabs,
  onChange,
  errors,
}: {
  slabs: SlabDraft[]
  onChange: (s: SlabDraft[]) => void
  errors: string[]
}) {
  const set = (i: number, patch: Partial<SlabDraft>) => onChange(slabs.map((s, j) => (j === i ? { ...s, ...patch } : s)))
  return (
    <fieldset className="fieldset stack">
      <legend>Print rate table</legend>
      {errors.length > 0 && <p className="err">{errors.join(' ')}</p>}
      <div className="scroll-x">
        <table className="tbl slab-table">
          <thead>
            <tr>
              <th scope="col">Up to impressions per plate</th>
              <th scope="col">Charged as</th>
              <th scope="col">Rate</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {slabs.map((s, i) => (
              <tr key={i}>
                <td>
                  <label className="sr-only" htmlFor={`slab-up-${i}`}>
                    Slab {i + 1} up to impressions per plate
                  </label>
                  <input id={`slab-up-${i}`} className="in" type="number" min={0} step={1} value={s.upTo} placeholder="and above" onChange={(e) => set(i, { upTo: e.target.value })} />
                </td>
                <td>
                  <label className="sr-only" htmlFor={`slab-type-${i}`}>
                    Slab {i + 1} charge type
                  </label>
                  <select id={`slab-type-${i}`} className="in" value={s.chargeType} onChange={(e) => set(i, { chargeType: e.target.value as PressChargeType })}>
                    <option value="flatPerPlate">{chargeTypeLabel.flatPerPlate}</option>
                    <option value="perThousand">{chargeTypeLabel.perThousand}</option>
                  </select>
                </td>
                <td>
                  <label className="sr-only" htmlFor={`slab-rate-${i}`}>
                    Slab {i + 1} rate
                  </label>
                  <input id={`slab-rate-${i}`} className="in" type="number" min={0} step="any" required value={s.rate} onChange={(e) => set(i, { rate: e.target.value })} />
                </td>
                <td>
                  <button type="button" className="btn-icon" onClick={() => onChange(slabs.filter((_, j) => j !== i))} aria-label={`Remove slab ${i + 1}`}>
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="hint">Leave “up to” blank for the last slab (“and above”).</p>
      <div>
        <button type="button" className="btn btn-s btn-sm" onClick={() => onChange([...slabs, { upTo: '', chargeType: 'perThousand', rate: '' }])}>
          Add slab
        </button>
      </div>
    </fieldset>
  )
}

/** Shows which slab an impressions-per-plate value falls into. Client-side, display only. */
function TryIt({ slabs }: { slabs: SlabDraft[] }) {
  const [value, setValue] = useState('')
  const n = toNumber(value)
  const parsed = slabs.map((s) => ({ ...s, upToImpressionsPerPlate: toNumber(s.upTo) }))
  const hit = n === null ? undefined : findPressSlab(parsed, n)

  let result = 'Enter a number of impressions per plate.'
  if (n !== null && !hit) result = 'No slab covers this value. Add an “and above” slab.'
  if (n !== null && hit) {
    const range = hit.upToImpressionsPerPlate == null ? 'the “and above” slab' : `the slab up to ${formatQuantity(hit.upToImpressionsPerPlate)}`
    const charge =
      hit.chargeType === 'flatPerPlate'
        ? `${formatMoney(toNumber(hit.rate))} flat per plate`
        : `${formatMoney(toNumber(hit.rate))} per 1,000 impressions`
    result = `${formatQuantity(n)} per plate falls in ${range}: ${charge}.`
  }

  return (
    <div className="note-box stack-sm">
      <NumberField label="Try it: impressions per plate" value={value} onChange={setValue} min={0} step={1} />
      <p style={{ fontWeight: 600, color: 'var(--c-primary-dark)' }} aria-live="polite">
        {result}
      </p>
    </div>
  )
}
