import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../api/client'
import { papersApi } from '../../api/masterData'
import type { Paper, PaperInput, PaperUnit } from '../../api/types'
import { CrudSection, FormActions, type EntityFormProps } from '../../components/CrudSection'
import { CheckboxField, NumberField, SelectField, TextField } from '../../components/form/Fields'
import { PageHeader } from '../../components/PageHeader'
import { ProblemBanner } from '../../components/ProblemBanner'
import { formatDate, formatMoney, formatQuantity, formatSize } from '../../lib/format'
import { unitLabel } from '../../lib/labels'
import { requiredNumber, toInput, toNumber } from '../../lib/numbers'
import { pricePerRimFromKg, rimWeightKg, SHEETS_PER_RIM } from '../../lib/rates'

export function PapersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Paper & stock"
        description="Every paper the press buys, priced per rim (500 full sheets) or per sheet. Enter the market price per kg and the helper works out the rim price from gsm and sheet size."
      />
      <CrudSection
        resource={papersApi}
        title="Papers"
        noun="paper"
        columns={[
          { header: 'Type', cell: (p) => p.paperType },
          { header: 'GSM', num: true, cell: (p) => p.gsm },
          { header: 'Full sheet', cell: (p) => formatSize(p.sheetWidthIn, p.sheetHeightIn) },
          { header: 'Sold by', cell: (p) => p.unit },
          { header: 'Price', num: true, cell: (p) => formatMoney(p.pricePerUnit) },
          { header: 'Rim weight (kg)', num: true, cell: (p) => formatQuantity(p.rimWeightKg) },
          { header: 'Per kg', num: true, cell: (p) => formatMoney(p.pricePerKg) },
          { header: 'Effective from', cell: (p) => formatDate(p.effectiveFrom) },
        ]}
        Form={PaperForm}
        sort={(a, b) => a.gsm - b.gsm || a.name.localeCompare(b.name)}
        footer="Rim weight and price per kg are computed by the API."
      />
    </>
  )
}

const today = () => new Date().toISOString().slice(0, 10)

function PaperForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<Paper, PaperInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [paperType, setPaperType] = useState(initial?.paperType ?? '')
  const [gsm, setGsm] = useState(toInput(initial?.gsm))
  const [width, setWidth] = useState(toInput(initial?.sheetWidthIn ?? 23))
  const [height, setHeight] = useState(toInput(initial?.sheetHeightIn ?? 36))
  const [unit, setUnit] = useState<PaperUnit>(initial?.unit ?? 'rim')
  const [price, setPrice] = useState(toInput(initial?.pricePerUnit))
  const [effectiveFrom, setEffectiveFrom] = useState(initial?.effectiveFrom?.slice(0, 10) ?? today())
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      paperType: paperType.trim(),
      gsm: requiredNumber(gsm),
      sheetWidthIn: requiredNumber(width),
      sheetHeightIn: requiredNumber(height),
      unit,
      pricePerUnit: requiredNumber(price),
      effectiveFrom,
      isActive,
    })
  }
  const err = (f: string) => fieldErrors(error, f)

  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={err('name')} placeholder="e.g. 55 gsm Offset (Partex)" />
      <div className="grid2">
        <TextField label="Paper type" value={paperType} onChange={setPaperType} required errors={err('paperType')} placeholder="Offset, Art paper…" />
        <NumberField label="GSM" value={gsm} onChange={setGsm} min={1} step={1} required errors={err('gsm')} />
        <NumberField label="Sheet width (in)" value={width} onChange={setWidth} min={0} required errors={err('sheetWidthIn')} />
        <NumberField label="Sheet height (in)" value={height} onChange={setHeight} min={0} required errors={err('sheetHeightIn')} />
        <SelectField
          label="Sold by"
          value={unit}
          onChange={(v) => setUnit(v as PaperUnit)}
          options={[
            { value: 'rim', label: unitLabel.rim },
            { value: 'sheet', label: unitLabel.sheet },
          ]}
          errors={err('unit')}
        />
        <NumberField label={`Price per ${unit}`} value={price} onChange={setPrice} min={0} required errors={err('pricePerUnit')} />
        <TextField label="Effective from" type="date" value={effectiveFrom} onChange={setEffectiveFrom} required errors={err('effectiveFrom')} />
      </div>
      <KgHelper
        width={toNumber(width)}
        height={toNumber(height)}
        gsm={toNumber(gsm)}
        unit={unit}
        onUse={(p) => setPrice(String(p))}
      />
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}

/** Market price per kg -> price per rim (or per sheet). Display helper only. */
function KgHelper({
  width,
  height,
  gsm,
  unit,
  onUse,
}: {
  width: number | null
  height: number | null
  gsm: number | null
  unit: PaperUnit
  onUse: (price: number) => void
}) {
  const [perKg, setPerKg] = useState('')
  const kg = toNumber(perKg)
  const ready = width !== null && height !== null && gsm !== null && width > 0 && height > 0 && gsm > 0
  const weight = ready ? rimWeightKg(width, height, gsm) : null
  const perRim = ready && kg !== null ? pricePerRimFromKg(width, height, gsm, kg) : null
  const perUnit = perRim === null ? null : unit === 'rim' ? perRim : Math.round((perRim / SHEETS_PER_RIM) * 100) / 100

  return (
    <div className="note-box stack">
      <NumberField label="Market price per kg (helper)" value={perKg} onChange={setPerKg} min={0} />
      {ready ? (
        <p>
          Rim weight = {formatQuantity(width)} × {formatQuantity(height)} in × 0.00064516 m² × {gsm} gsm × 500 sheets ÷ 1000
          = <strong>{formatQuantity(weight)} kg</strong>.
          {perRim !== null && (
            <>
              {' '}
              At {formatMoney(kg)} per kg, one rim costs <strong>{formatMoney(perRim)}</strong>
              {unit === 'sheet' && (
                <>
                  , one sheet <strong>{formatMoney(perUnit)}</strong>
                </>
              )}
              .
            </>
          )}
        </p>
      ) : (
        <p>Enter gsm and sheet size to see the rim weight.</p>
      )}
      {perUnit !== null && (
        <div>
          <button type="button" className="btn btn-s btn-sm" onClick={() => onUse(perUnit)}>
            Use {formatMoney(perUnit)} as price per {unit}
          </button>
        </div>
      )}
    </div>
  )
}
