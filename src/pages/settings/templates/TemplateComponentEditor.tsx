import { Trash2 } from 'lucide-react'
import type { ComponentMeasure, FieldBehaviour, FinishingOperation, Paper, Press, TemplateFieldKey } from '../../../api/types'
import { CheckboxField, NumberField, SelectField, TextField } from '../../../components/form/Fields'
import { basisLabel, behaviourLabel, fieldLabel, fieldsForMeasure, measureLabel } from '../../../lib/labels'
import type { FieldDraft, FinishingDraft, TemplateComponentDraft } from './templateDraft'

export interface TemplateRefs {
  papers: Paper[]
  presses: Press[]
  finishingOps: FinishingOperation[]
}

interface Props {
  component: TemplateComponentDraft
  index: number
  refs: TemplateRefs
  onChange: (fn: (c: TemplateComponentDraft) => TemplateComponentDraft) => void
  onRemove: () => void
}

const BEHAVIOURS: FieldBehaviour[] = ['ask', 'default', 'locked']

export function TemplateComponentEditor({ component: c, index, refs, onChange, onRemove }: Props) {
  const keys = fieldsForMeasure(c.measure)
  const unused = keys.filter((k) => !c.fields.some((f) => f.fieldKey === k))
  const label = c.name || `Component ${index + 1}`

  const setField = (i: number, patch: Partial<FieldDraft>) =>
    onChange((x) => ({ ...x, fields: x.fields.map((f, j) => (j === i ? { ...f, ...patch } : f)) }))
  const setFinishing = (i: number, patch: Partial<FinishingDraft>) =>
    onChange((x) => ({
      ...x,
      defaultFinishing: x.defaultFinishing.map((f, j) => (j === i ? { ...f, ...patch } : f)),
    }))

  return (
    <div className="component-box">
      <div className="component-head">
        <h3 style={{ fontSize: 15, fontWeight: 600 }}>{label}</h3>
        <button type="button" className="btn btn-g" onClick={onRemove} aria-label={`Remove component ${label}`}>
          Remove component
        </button>
      </div>

      <div className="grid2">
        <TextField label="Component name" value={c.name} onChange={(name) => onChange((x) => ({ ...x, name }))} required placeholder="Cover, Inner, Map…" />
        <SelectField
          label="Measured by"
          value={c.measure}
          onChange={(m) =>
            onChange((x) => ({
              ...x,
              measure: m as ComponentMeasure,
              // Drop fields that do not apply to the new measure.
              fields: x.fields.filter((f) => fieldsForMeasure(m as ComponentMeasure).includes(f.fieldKey)),
            }))
          }
          options={[
            { value: 'forma', label: measureLabel.forma },
            { value: 'ups', label: measureLabel.ups },
          ]}
        />
        <NumberField label="Sort order" value={c.sortOrder} onChange={(sortOrder) => onChange((x) => ({ ...x, sortOrder }))} step={1} />
        <CheckboxField
          label="Counts toward binding forma"
          checked={c.countsTowardBindingForma}
          onChange={(v) => onChange((x) => ({ ...x, countsTowardBindingForma: v }))}
        />
      </div>

      <fieldset className="fieldset stack-sm">
        <legend>Fields on the quote form</legend>
        {c.fields.length === 0 ? (
          <p className="small muted">No field rules: every field uses the builder's defaults and stays editable.</p>
        ) : (
          <div className="scroll-x" style={{ border: '1px solid var(--c-border)', borderRadius: 8 }}>
            <table className="tbl template-field-table">
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">On the quote form</th>
                  <th scope="col">Default value</th>
                  <th scope="col">Allowed values</th>
                  <th scope="col">Min</th>
                  <th scope="col">Max</th>
                  <th scope="col">Step</th>
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.fields.map((f, i) => (
                  <FieldRow
                    key={`${f.fieldKey}-${i}`}
                    field={f}
                    rowLabel={`${label} field ${i + 1}`}
                    keys={keys.filter((k) => k === f.fieldKey || unused.includes(k))}
                    refs={refs}
                    onChange={(patch) => setField(i, patch)}
                    onRemove={() => onChange((x) => ({ ...x, fields: x.fields.filter((_, j) => j !== i) }))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {unused.length > 0 && (
          <div>
            <button
              type="button"
              className="btn btn-s btn-sm"
              onClick={() =>
                onChange((x) => ({
                  ...x,
                  fields: [
                    ...x.fields,
                    { fieldKey: unused[0], behaviour: 'default', defaultValue: '', allowedValues: '', min: '', max: '', step: '' },
                  ],
                }))
              }
            >
              Add field
            </button>
          </div>
        )}
        <p className="hint">Allowed values: a comma-separated list, e.g. “1, 2, 4”. For paper and press, a list of IDs.</p>
      </fieldset>

      <fieldset className="fieldset stack-sm">
        <legend>Default finishing</legend>
        {c.defaultFinishing.map((f, i) => {
          const op = refs.finishingOps.find((o) => o.id === f.finishingOperationId)
          return (
            <div key={i} className="grid2" style={{ alignItems: 'end' }}>
              <SelectField
                label={`Finishing ${i + 1}`}
                value={f.finishingOperationId}
                onChange={(finishingOperationId) => setFinishing(i, { finishingOperationId })}
                options={refs.finishingOps
                  .filter((o) => o.isActive || o.id === f.finishingOperationId)
                  .map((o) => ({ value: o.id, label: `${o.name} (${basisLabel[o.basis]})` }))}
                placeholder="Choose…"
              />
              {op?.basis === 'perSquareInch' ? (
                <SelectField
                  label="Sides"
                  value={f.sides || '1'}
                  onChange={(sides) => setFinishing(i, { sides })}
                  options={[
                    { value: '1', label: '1 side' },
                    { value: '2', label: '2 sides' },
                  ]}
                />
              ) : (
                <span />
              )}
              <div>
                <button
                  type="button"
                  className="btn btn-g"
                  onClick={() => onChange((x) => ({ ...x, defaultFinishing: x.defaultFinishing.filter((_, j) => j !== i) }))}
                  aria-label={`Remove finishing ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            </div>
          )
        })}
        <div>
          <button
            type="button"
            className="btn btn-s btn-sm"
            onClick={() =>
              onChange((x) => ({ ...x, defaultFinishing: [...x.defaultFinishing, { finishingOperationId: '', sides: '' }] }))
            }
          >
            Add finishing
          </button>
        </div>
      </fieldset>
    </div>
  )
}

function FieldRow({
  field: f,
  rowLabel,
  keys,
  refs,
  onChange,
  onRemove,
}: {
  field: FieldDraft
  rowLabel: string
  keys: TemplateFieldKey[]
  refs: TemplateRefs
  onChange: (patch: Partial<FieldDraft>) => void
  onRemove: () => void
}) {
  const idOptions =
    f.fieldKey === 'paperId'
      ? refs.papers.map((p) => ({ value: p.id, label: p.name }))
      : f.fieldKey === 'pressId' || f.fieldKey === 'halfFormaPressId'
        ? refs.presses.map((p) => ({ value: p.id, label: p.name }))
        : null
  const cell = (name: string) => `${rowLabel} ${name}`

  return (
    <tr>
      <td>
        <SelectField label={cell('field')} hideLabel value={f.fieldKey} onChange={(v) => onChange({ fieldKey: v as TemplateFieldKey })} options={keys.map((k) => ({ value: k, label: fieldLabel[k] }))} />
      </td>
      <td>
        <SelectField
          label={cell('behaviour')}
          hideLabel
          value={f.behaviour}
          onChange={(v) => onChange({ behaviour: v as FieldBehaviour })}
          options={BEHAVIOURS.map((b) => ({ value: b, label: behaviourLabel[b] }))}
          ask={f.behaviour === 'ask'}
        />
      </td>
      <td style={{ minWidth: 150 }}>
        {idOptions ? (
          <SelectField label={cell('default value')} hideLabel value={f.defaultValue} onChange={(defaultValue) => onChange({ defaultValue })} options={idOptions} placeholder="None" />
        ) : (
          <TextField label={cell('default value')} hideLabel value={f.defaultValue} onChange={(defaultValue) => onChange({ defaultValue })} />
        )}
      </td>
      <td style={{ minWidth: 130 }}>
        <TextField label={cell('allowed values')} hideLabel value={f.allowedValues} onChange={(allowedValues) => onChange({ allowedValues })} placeholder="e.g. 1, 2, 4" />
      </td>
      <td style={{ minWidth: 80 }}>
        <NumberField label={cell('min')} hideLabel value={f.min} onChange={(min) => onChange({ min })} />
      </td>
      <td style={{ minWidth: 80 }}>
        <NumberField label={cell('max')} hideLabel value={f.max} onChange={(max) => onChange({ max })} />
      </td>
      <td style={{ minWidth: 80 }}>
        <NumberField label={cell('step')} hideLabel value={f.step} onChange={(step) => onChange({ step })} />
      </td>
      <td>
        <button type="button" className="btn-icon" onClick={onRemove} aria-label={`Remove ${rowLabel}`}>
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </td>
    </tr>
  )
}
