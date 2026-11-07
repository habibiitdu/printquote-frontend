import type { ComponentMeasure, TemplateFieldKey } from '../../api/types'
import { CheckboxField, SelectField, TextField } from '../../components/form/Fields'
import { basisLabel, fieldsForMeasure, measureLabel } from '../../lib/labels'
import type { ComponentDraft, Masters } from '../../lib/quoteDraft'
import { ComponentField } from './ComponentField'

interface Props {
  component: ComponentDraft
  masters: Masters
  onChange: (fn: (c: ComponentDraft) => ComponentDraft) => void
  onRemove: () => void
}

const SIDES_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1', label: '1 side' },
  { value: '2', label: '2 sides' },
]

export function ComponentEditor({ component: c, masters, onChange, onRemove }: Props) {
  const setValue = (key: TemplateFieldKey, value: string) =>
    onChange((x) => ({ ...x, values: { ...x.values, [key]: value } }))
  const setFinishing = (id: string, sides: number) =>
    onChange((x) => ({ ...x, finishing: { ...x.finishing, [id]: sides } }))

  // Fixed-basis operations are job extras; show them here only if the template put one on the component.
  const ops = masters.finishingOps.filter(
    (o) => (o.isActive && o.basis !== 'fixed') || c.finishing[o.id] !== undefined,
  )

  return (
    <div className="component-box">
      <div className="component-head">
        <div className="inline-pair" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <TextField
            label="Component name"
            value={c.name}
            onChange={(name) => onChange((x) => ({ ...x, name }))}
            required
          />
          {c.fromTemplate ? (
            <span className="chip chip-info" style={{ marginBottom: 12 }}>
              {measureLabel[c.measure]}
            </span>
          ) : (
            <SelectField
              label="Measured by"
              value={c.measure}
              onChange={(m) =>
                onChange((x) => ({
                  ...x,
                  measure: m as ComponentMeasure,
                  countsTowardBindingForma: m === 'forma' ? x.countsTowardBindingForma : false,
                }))
              }
              options={[
                { value: 'forma', label: measureLabel.forma },
                { value: 'ups', label: measureLabel.ups },
              ]}
            />
          )}
        </div>
        <button type="button" className="btn btn-g" onClick={onRemove} aria-label={`Remove component ${c.name || ''}`}>
          Remove
        </button>
      </div>

      <div className="grid2">
        {fieldsForMeasure(c.measure).map((key) => (
          <ComponentField
            key={key}
            fieldKey={key}
            rule={c.rules[key]}
            value={c.values[key]}
            onChange={(v) => setValue(key, v)}
            masters={masters}
          />
        ))}
      </div>

      {c.measure === 'forma' && (
        <CheckboxField
          label="Counts toward binding forma (inner pages)"
          checked={c.countsTowardBindingForma}
          onChange={(v) => onChange((x) => ({ ...x, countsTowardBindingForma: v }))}
        />
      )}

      {ops.length > 0 && (
        <fieldset className="fieldset">
          <legend>Finishing</legend>
          <div className="grid2">
            {ops.map((op) =>
              op.basis === 'perSquareInch' ? (
                <SelectField
                  key={op.id}
                  label={op.name}
                  value={String(c.finishing[op.id] ?? 0)}
                  onChange={(v) => setFinishing(op.id, Number(v))}
                  options={SIDES_OPTIONS}
                />
              ) : (
                <CheckboxField
                  key={op.id}
                  label={`${op.name} (${basisLabel[op.basis].toLowerCase()})`}
                  checked={(c.finishing[op.id] ?? 0) > 0}
                  onChange={(on) => setFinishing(op.id, on ? 1 : 0)}
                />
              ),
            )}
          </div>
        </fieldset>
      )}
    </div>
  )
}
