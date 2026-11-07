// Editable (string-based) form of a product template, and conversion to the API body.

import type {
  ComponentMeasure,
  FieldBehaviour,
  ProductTemplate,
  ProductTemplateInput,
  TemplateFieldKey,
} from '../../../api/types'
import { toInput, toNumber } from '../../../lib/numbers'

export interface FieldDraft {
  fieldKey: TemplateFieldKey
  behaviour: FieldBehaviour
  defaultValue: string
  allowedValues: string
  min: string
  max: string
  step: string
}

export interface FinishingDraft {
  finishingOperationId: string
  sides: string
}

export interface TemplateComponentDraft {
  key: string
  name: string
  measure: ComponentMeasure
  sortOrder: string
  countsTowardBindingForma: boolean
  defaultFinishing: FinishingDraft[]
  fields: FieldDraft[]
}

export interface TemplateExtraDraft {
  finishingOperationId: string
  defaultAmount: string
}

export interface TemplateDraft {
  name: string
  description: string
  defaultPageWidthIn: string
  defaultPageHeightIn: string
  defaultBindingTypeId: string
  profitPercent: string
  isActive: boolean
  components: TemplateComponentDraft[]
  extras: TemplateExtraDraft[]
}

let seq = 0
export const newComponentKey = () => `tc${++seq}`

export function newTemplateComponent(sortOrder: number): TemplateComponentDraft {
  return {
    key: newComponentKey(),
    name: '',
    measure: 'forma',
    sortOrder: String(sortOrder),
    countsTowardBindingForma: true,
    defaultFinishing: [],
    fields: [],
  }
}

export function toTemplateDraft(t: ProductTemplate | null): TemplateDraft {
  return {
    name: t?.name ?? '',
    description: t?.description ?? '',
    defaultPageWidthIn: toInput(t?.defaultPageWidthIn),
    defaultPageHeightIn: toInput(t?.defaultPageHeightIn),
    defaultBindingTypeId: t?.defaultBindingTypeId ?? '',
    profitPercent: toInput(t?.profitPercent),
    isActive: t?.isActive ?? true,
    components: [...(t?.components ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        key: newComponentKey(),
        name: c.name,
        measure: c.measure,
        sortOrder: String(c.sortOrder),
        countsTowardBindingForma: c.countsTowardBindingForma,
        defaultFinishing: c.defaultFinishing.map((f) => ({
          finishingOperationId: f.finishingOperationId,
          sides: toInput(f.sides),
        })),
        fields: c.fields.map((f) => ({
          fieldKey: f.fieldKey,
          behaviour: f.behaviour,
          defaultValue: f.defaultValue ?? '',
          allowedValues: f.allowedValues ?? '',
          min: toInput(f.min),
          max: toInput(f.max),
          step: toInput(f.step),
        })),
      })),
    extras: (t?.extras ?? []).map((x) => ({
      finishingOperationId: x.finishingOperationId,
      defaultAmount: toInput(x.defaultAmount),
    })),
  }
}

const blankToNull = (s: string) => (s.trim() === '' ? null : s.trim())

export function toTemplateInput(d: TemplateDraft): ProductTemplateInput {
  return {
    name: d.name.trim(),
    description: d.description.trim(),
    defaultPageWidthIn: toNumber(d.defaultPageWidthIn),
    defaultPageHeightIn: toNumber(d.defaultPageHeightIn),
    defaultBindingTypeId: d.defaultBindingTypeId || null,
    profitPercent: toNumber(d.profitPercent),
    isActive: d.isActive,
    components: d.components.map((c, i) => ({
      name: c.name.trim(),
      measure: c.measure,
      sortOrder: toNumber(c.sortOrder) ?? i + 1,
      countsTowardBindingForma: c.countsTowardBindingForma,
      defaultFinishing: c.defaultFinishing
        .filter((f) => f.finishingOperationId)
        .map((f) => ({ finishingOperationId: f.finishingOperationId, sides: toNumber(f.sides) })),
      fields: c.fields.map((f) => ({
        fieldKey: f.fieldKey,
        behaviour: f.behaviour,
        defaultValue: blankToNull(f.defaultValue),
        allowedValues: blankToNull(f.allowedValues),
        min: toNumber(f.min),
        max: toNumber(f.max),
        step: toNumber(f.step),
      })),
    })),
    extras: d.extras
      .filter((x) => x.finishingOperationId)
      .map((x) => ({ finishingOperationId: x.finishingOperationId, defaultAmount: toNumber(x.defaultAmount) })),
  }
}
