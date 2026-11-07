// The quote builder keeps a "draft" (strings, so fields can be blank) and turns it
// into a JobSpec for the API. No pricing happens here: the API does all of it.

import type {
  AppSettings,
  BindingType,
  Company,
  ComponentMeasure,
  ComponentSpec,
  Customer,
  FinishingOperation,
  JobSpec,
  Paper,
  Press,
  ProductTemplate,
  TemplateComponent,
  TemplateField,
  TemplateFieldKey,
} from '../api/types'
import { ALL_FIELDS, fieldLabel, fieldsForMeasure } from './labels'
import { toInput, toNumber } from './numbers'

export interface Masters {
  companies: Company[]
  customers: Customer[]
  papers: Paper[]
  presses: Press[]
  finishingOps: FinishingOperation[]
  bindingTypes: BindingType[]
  templates: ProductTemplate[]
  settings: AppSettings
}

export type FieldValues = Record<TemplateFieldKey, string>
export type FieldRules = Partial<Record<TemplateFieldKey, TemplateField>>

export interface ComponentDraft {
  key: string
  name: string
  measure: ComponentMeasure
  countsTowardBindingForma: boolean
  /** Template rules for this component's fields (ask / default / locked). */
  rules: FieldRules
  values: FieldValues
  /** finishingOperationId -> sides. 0 = off. Operations not per square inch use 1 for "on". */
  finishing: Record<string, number>
  fromTemplate: boolean
}

export interface ExtraDraft {
  finishingOperationId: string
  included: boolean
  /** Amount for fixed-basis operations; blank = configured rate. */
  amount: string
}

export interface QuoteDraft {
  companyId: string
  customerId: string
  jobName: string
  templateId: string
  quantity: string
  pageWidthIn: string
  pageHeightIn: string
  components: ComponentDraft[]
  bindingTypeId: string
  extras: ExtraDraft[]
  commissionPercent: string
  overheadPercent: string
  marketingPercent: string
  profitPercentOverride: string
  note: string
}

let keySeq = 0
const newKey = () => `c${++keySeq}`

const firstActive = <T extends { id: string; isActive: boolean }>(rows: T[]) => rows.find((r) => r.isActive)?.id ?? ''

/** Values used when the template does not mention a field. */
function fallbackValues(masters: Masters): FieldValues {
  return {
    forma: '1',
    colors: '1',
    paperId: firstActive(masters.papers),
    pressId: firstActive(masters.presses),
    halfFormaPressId: '',
    openWidthIn: '',
    openHeightIn: '',
    colorsFront: '1',
    colorsBack: '0',
  }
}

export function emptyComponent(masters: Masters, measure: ComponentMeasure, name: string): ComponentDraft {
  return {
    key: newKey(),
    name,
    measure,
    countsTowardBindingForma: measure === 'forma',
    rules: {},
    values: fallbackValues(masters),
    finishing: {},
    fromTemplate: false,
  }
}

function componentFromTemplate(tc: TemplateComponent, masters: Masters): ComponentDraft {
  const rules: FieldRules = {}
  for (const f of tc.fields) rules[f.fieldKey] = f
  const fallback = fallbackValues(masters)
  const values = { ...fallback }
  for (const key of ALL_FIELDS) {
    const rule = rules[key]
    if (!rule) continue
    values[key] = rule.behaviour === 'ask' ? '' : (rule.defaultValue ?? fallback[key])
  }
  // A default that names no known paper or press is dropped, so the user has to choose one.
  if (!masters.papers.some((p) => p.id === values.paperId)) values.paperId = ''
  if (!masters.presses.some((p) => p.id === values.pressId)) values.pressId = ''
  if (values.halfFormaPressId && !masters.presses.some((p) => p.id === values.halfFormaPressId))
    values.halfFormaPressId = ''
  const finishing: Record<string, number> = {}
  for (const sel of tc.defaultFinishing) {
    const op = masters.finishingOps.find((o) => o.id === sel.finishingOperationId)
    finishing[sel.finishingOperationId] = op?.basis === 'perSquareInch' ? (sel.sides ?? 1) : 1
  }
  return {
    key: newKey(),
    name: tc.name,
    measure: tc.measure,
    countsTowardBindingForma: tc.countsTowardBindingForma,
    rules,
    values,
    finishing,
    fromTemplate: true,
  }
}

/** Replaces the template-driven parts of a draft (components, binding, extras, page size). */
export function applyTemplate(draft: QuoteDraft, template: ProductTemplate | undefined, masters: Masters): QuoteDraft {
  if (!template) {
    return {
      ...draft,
      templateId: '',
      components: [emptyComponent(masters, 'forma', 'Inner')],
      bindingTypeId: '',
      extras: [],
    }
  }
  return {
    ...draft,
    templateId: template.id,
    pageWidthIn: toInput(template.defaultPageWidthIn) || draft.pageWidthIn,
    pageHeightIn: toInput(template.defaultPageHeightIn) || draft.pageHeightIn,
    components: [...template.components]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tc) => componentFromTemplate(tc, masters)),
    bindingTypeId: template.defaultBindingTypeId ?? '',
    extras: template.extras.map((x) => ({
      finishingOperationId: x.finishingOperationId,
      included: true,
      amount: toInput(x.defaultAmount),
    })),
  }
}

export function newDraft(masters: Masters, template: ProductTemplate | undefined): QuoteDraft {
  const s = masters.settings
  const base: QuoteDraft = {
    companyId: firstActive(masters.companies),
    customerId: '',
    jobName: '',
    templateId: '',
    quantity: '',
    pageWidthIn: '',
    pageHeightIn: '',
    components: [],
    bindingTypeId: '',
    extras: [],
    commissionPercent: toInput(s.defaultCommissionPercent),
    overheadPercent: toInput(s.defaultOverheadPercent),
    marketingPercent: toInput(s.defaultMarketingPercent),
    profitPercentOverride: '',
    note: '',
  }
  return applyTemplate(base, template, masters)
}

/** Loads a saved spec back into the form (editing = saving a new version). */
export function draftFromSpec(
  spec: JobSpec,
  job: { jobName: string; companyId: string; customerId: string; templateId?: string | null },
  template: ProductTemplate | undefined,
): QuoteDraft {
  const tcs = template ? [...template.components].sort((a, b) => a.sortOrder - b.sortOrder) : []
  const components = spec.components.map((c, i): ComponentDraft => {
    const tc = tcs.find((t) => t.name === c.name) ?? tcs[i]
    const rules: FieldRules = {}
    if (tc && tc.measure === c.measure) for (const f of tc.fields) rules[f.fieldKey] = f
    const values: FieldValues = {
      forma: toInput(c.forma),
      colors: toInput(c.colors),
      paperId: c.paperId ?? '',
      pressId: c.pressId ?? '',
      halfFormaPressId: c.halfFormaPressId ?? '',
      openWidthIn: toInput(c.openWidthIn),
      openHeightIn: toInput(c.openHeightIn),
      colorsFront: toInput(c.colorsFront),
      colorsBack: toInput(c.colorsBack),
    }
    const finishing: Record<string, number> = {}
    for (const f of c.finishing ?? []) finishing[f.finishingOperationId] = f.sides ?? 1
    return {
      key: newKey(),
      name: c.name,
      measure: c.measure,
      countsTowardBindingForma: c.countsTowardBindingForma,
      rules,
      values,
      finishing,
      fromTemplate: Object.keys(rules).length > 0,
    }
  })
  return {
    companyId: job.companyId,
    customerId: job.customerId,
    jobName: job.jobName,
    templateId: job.templateId ?? spec.templateId ?? '',
    quantity: toInput(spec.quantity),
    pageWidthIn: toInput(spec.pageWidthIn),
    pageHeightIn: toInput(spec.pageHeightIn),
    components,
    bindingTypeId: spec.bindingTypeId ?? '',
    extras: (spec.extras ?? []).map((x) => ({
      finishingOperationId: x.finishingOperationId,
      included: true,
      amount: toInput(x.amount),
    })),
    commissionPercent: toInput(spec.commissionPercent),
    overheadPercent: toInput(spec.overheadPercent),
    marketingPercent: toInput(spec.marketingPercent),
    profitPercentOverride: toInput(spec.profitPercentOverride),
    note: '',
  }
}

// ---------- Building the spec ----------

export interface SpecResult {
  spec: JobSpec | null
  /** Plain-language reasons the spec cannot be priced yet. */
  issues: string[]
}

const isInt = (n: number | null): n is number => n !== null && Number.isInteger(n)
const isMultipleOf = (n: number, step: number) => Math.abs(n / step - Math.round(n / step)) < 1e-9

function checkRange(
  issues: string[],
  label: string,
  n: number | null,
  rule: TemplateField | undefined,
): void {
  if (n === null || !rule) return
  if (rule.min !== null && rule.min !== undefined && n < rule.min) issues.push(`${label} must be at least ${rule.min}.`)
  if (rule.max !== null && rule.max !== undefined && n > rule.max) issues.push(`${label} must be at most ${rule.max}.`)
}

function buildComponent(c: ComponentDraft, masters: Masters, issues: string[]): ComponentSpec {
  const label = (key: TemplateFieldKey) => `${c.name || 'Component'}: ${fieldLabel[key]}`
  const v = c.values
  const num = (key: TemplateFieldKey) => toNumber(v[key])

  if (!c.name.trim()) issues.push('Every component needs a name.')
  for (const key of fieldsForMeasure(c.measure)) {
    if (key === 'halfFormaPressId') continue
    if (v[key].trim() === '') issues.push(`${label(key)} is required.`)
  }
  if (v.paperId && !masters.papers.some((p) => p.id === v.paperId)) issues.push(`${label('paperId')} is not a known paper.`)
  if (v.pressId && !masters.presses.some((p) => p.id === v.pressId)) issues.push(`${label('pressId')} is not a known press.`)

  const finishing = Object.entries(c.finishing)
    .filter(([, sides]) => sides > 0)
    .map(([finishingOperationId, sides]) => {
      const op = masters.finishingOps.find((o) => o.id === finishingOperationId)
      return { finishingOperationId, sides: op?.basis === 'perSquareInch' ? sides : null }
    })

  const base = {
    name: c.name.trim(),
    measure: c.measure,
    paperId: v.paperId,
    pressId: v.pressId,
    countsTowardBindingForma: c.countsTowardBindingForma,
    finishing,
  }

  if (c.measure === 'forma') {
    const forma = num('forma')
    const colors = num('colors')
    if (v.forma && (forma === null || forma <= 0 || !isMultipleOf(forma, 0.125)))
      issues.push(`${label('forma')} must be a positive multiple of 0.125.`)
    if (v.colors && (!isInt(colors) || colors < 1 || colors > 4)) issues.push(`${label('colors')} must be 1 to 4.`)
    checkRange(issues, label('forma'), forma, c.rules.forma)
    checkRange(issues, label('colors'), colors, c.rules.colors)
    return { ...base, forma, colors, halfFormaPressId: v.halfFormaPressId || null }
  }

  const w = num('openWidthIn')
  const h = num('openHeightIn')
  const front = num('colorsFront')
  const back = num('colorsBack')
  if (v.openWidthIn && (w === null || w <= 0)) issues.push(`${label('openWidthIn')} must be more than 0.`)
  if (v.openHeightIn && (h === null || h <= 0)) issues.push(`${label('openHeightIn')} must be more than 0.`)
  if (v.colorsFront && (!isInt(front) || front < 1 || front > 4)) issues.push(`${label('colorsFront')} must be 1 to 4.`)
  if (v.colorsBack && (!isInt(back) || back < 0 || back > 4)) issues.push(`${label('colorsBack')} must be 0 to 4.`)
  checkRange(issues, label('openWidthIn'), w, c.rules.openWidthIn)
  checkRange(issues, label('openHeightIn'), h, c.rules.openHeightIn)
  checkRange(issues, label('colorsFront'), front, c.rules.colorsFront)
  checkRange(issues, label('colorsBack'), back, c.rules.colorsBack)
  return { ...base, openWidthIn: w, openHeightIn: h, colorsFront: front, colorsBack: back }
}

function percent(issues: string[], label: string, s: string): number {
  if (s.trim() === '') return 0
  const n = toNumber(s)
  if (n === null || n < 0) {
    issues.push(`${label} must be a number of 0 or more.`)
    return 0
  }
  return n
}

/** True when a forma component has a per-square-inch finishing (the page size is then needed). */
export function needsPageSize(draft: QuoteDraft, masters: Masters): boolean {
  return draft.components.some(
    (c) =>
      c.measure === 'forma' &&
      Object.entries(c.finishing).some(
        ([id, sides]) => sides > 0 && masters.finishingOps.find((o) => o.id === id)?.basis === 'perSquareInch',
      ),
  )
}

export function buildSpec(draft: QuoteDraft, masters: Masters): SpecResult {
  const issues: string[] = []

  const quantity = toNumber(draft.quantity)
  if (draft.quantity.trim() === '') issues.push('Quantity is required.')
  else if (!isInt(quantity) || quantity <= 0) issues.push('Quantity must be a whole number above 0.')

  if (draft.components.length === 0) issues.push('Add at least one component.')
  const components = draft.components.map((c) => buildComponent(c, masters, issues))

  const pageWidthIn = toNumber(draft.pageWidthIn)
  const pageHeightIn = toNumber(draft.pageHeightIn)
  if (needsPageSize(draft, masters) && (pageWidthIn === null || pageHeightIn === null))
    issues.push('Finished page size is required for lamination on forma components.')

  const extras = draft.extras
    .filter((x) => x.included)
    .map((x) => {
      const amount = toNumber(x.amount)
      if (x.amount.trim() !== '' && (amount === null || amount < 0)) issues.push('Extra amounts must be 0 or more.')
      return { finishingOperationId: x.finishingOperationId, amount }
    })

  const commissionPercent = percent(issues, 'Sales commission %', draft.commissionPercent)
  const overheadPercent = percent(issues, 'Overhead %', draft.overheadPercent)
  const marketingPercent = percent(issues, 'Marketing %', draft.marketingPercent)
  const profitPercentOverride = toNumber(draft.profitPercentOverride)
  if (draft.profitPercentOverride.trim() !== '' && profitPercentOverride === null)
    issues.push('Profit % must be a number, or blank to use the rules.')

  if (issues.length > 0) return { spec: null, issues }

  return {
    issues,
    spec: {
      quantity: quantity as number,
      pageWidthIn,
      pageHeightIn,
      components,
      bindingTypeId: draft.bindingTypeId || null,
      extras,
      commissionPercent,
      overheadPercent,
      marketingPercent,
      profitPercentOverride,
      customerId: draft.customerId || null,
      templateId: draft.templateId || null,
    },
  }
}

/** Extra checks before saving (job fields are not part of the spec). */
export function saveIssues(draft: QuoteDraft, isEdit: boolean): string[] {
  const issues: string[] = []
  if (!draft.jobName.trim()) issues.push('Job name is required.')
  if (!isEdit && !draft.companyId) issues.push('Choose a letterhead.')
  if (!isEdit && !draft.customerId) issues.push('Choose a customer.')
  return issues
}
