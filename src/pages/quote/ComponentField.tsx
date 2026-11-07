import type { TemplateField, TemplateFieldKey } from '../../api/types'
import { LockedValue, NumberField, SelectField, type Option } from '../../components/form/Fields'
import { fieldLabel } from '../../lib/labels'
import { splitList } from '../../lib/numbers'
import type { Masters } from '../../lib/quoteDraft'

interface Props {
  fieldKey: TemplateFieldKey
  rule: TemplateField | undefined
  value: string
  onChange: (value: string) => void
  masters: Masters
}

const ID_FIELDS: TemplateFieldKey[] = ['paperId', 'pressId', 'halfFormaPressId']

/** Input limits used when the template does not set any. */
const NUMERIC_DEFAULTS: Partial<Record<TemplateFieldKey, { min: number; max?: number; step: number }>> = {
  forma: { min: 0.125, step: 0.125 },
  colors: { min: 1, max: 4, step: 1 },
  colorsFront: { min: 1, max: 4, step: 1 },
  colorsBack: { min: 0, max: 4, step: 1 },
  openWidthIn: { min: 0, step: 0.01 },
  openHeightIn: { min: 0, step: 0.01 },
}

function idOptions(key: TemplateFieldKey, masters: Masters, value: string): Option[] {
  const rows =
    key === 'paperId'
      ? masters.papers.map((p) => ({ id: p.id, isActive: p.isActive, label: p.name }))
      : masters.presses.map((p) => ({ id: p.id, isActive: p.isActive, label: `${p.name} (${p.sheetWidthIn} × ${p.sheetHeightIn})` }))
  // Active rows, plus the current value even if it has since been deactivated.
  return rows.filter((r) => r.isActive || r.id === value).map((r) => ({ value: r.id, label: r.label }))
}

/** One component field, rendered per its template behaviour: locked, default or ask. */
export function ComponentField({ fieldKey, rule, value, onChange, masters }: Props) {
  const label = fieldLabel[fieldKey]
  const behaviour = rule?.behaviour ?? 'default'
  const ask = behaviour === 'ask'
  const isId = ID_FIELDS.includes(fieldKey)
  const allowed = splitList(rule?.allowedValues)

  if (isId) {
    let options = idOptions(fieldKey, masters, value)
    if (allowed.length > 0) options = options.filter((o) => allowed.includes(o.value) || o.value === value)
    const lockedOption = options.find((o) => o.value === value)
    // A locked field whose default names nothing known stays editable, or the job could never be priced.
    if (behaviour === 'locked' && lockedOption) return <LockedValue label={label} value={lockedOption.label} />
    const optional = fieldKey === 'halfFormaPressId'
    return (
      <SelectField
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={optional ? 'None (same press)' : ask || value === '' ? 'Choose…' : undefined}
        required={!optional}
        ask={ask}
        hint={optional ? 'Prints the fractional forma on this press.' : undefined}
      />
    )
  }

  if (behaviour === 'locked') return <LockedValue label={label} value={value || '—'} />

  if (allowed.length > 0) {
    const options = allowed.map((a) => ({ value: a, label: a }))
    if (value && !allowed.includes(value)) options.unshift({ value, label: value })
    return (
      <SelectField
        label={label}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={ask || value === '' ? 'Choose…' : undefined}
        required
        ask={ask}
      />
    )
  }

  const d = NUMERIC_DEFAULTS[fieldKey]
  return (
    <NumberField
      label={label}
      value={value}
      onChange={onChange}
      min={rule?.min ?? d?.min}
      max={rule?.max ?? d?.max}
      step={rule?.step ?? d?.step}
      required
      ask={ask}
    />
  )
}
