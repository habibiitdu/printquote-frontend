// Types mirroring the PrintQuote API contract (technical-design.md, sections 4 and 6).
// JSON is camelCase, enums travel as camelCase strings, IDs are GUID strings,
// dates are ISO 8601 strings. Optional values may be omitted or sent as null.

export type Guid = string

// ---------- Enums ----------

export type PaperUnit = 'rim' | 'sheet'
export type PressChargeType = 'flatPerPlate' | 'perThousand'
export type FinishingBasis = 'perSquareInch' | 'perThousand' | 'perPiece' | 'fixed'
export type ComponentMeasure = 'forma' | 'ups'
export type FieldBehaviour = 'ask' | 'default' | 'locked'
export type QuotationStatus = 'draft' | 'sent' | 'approved' | 'lost'
export type CostLineCategory = 'rawMaterial' | 'conversion'

export type TemplateFieldKey =
  | 'forma'
  | 'colors'
  | 'paperId'
  | 'pressId'
  | 'halfFormaPressId'
  | 'openWidthIn'
  | 'openHeightIn'
  | 'colorsFront'
  | 'colorsBack'

// ---------- Errors (RFC 7807) ----------

export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  /** Validation errors: field -> messages. */
  errors?: Record<string, string[]>
}

// ---------- Master data (6.1) ----------

export interface CompanyInput {
  name: string
  address: string
  phone: string
  isActive: boolean
}
export interface Company extends CompanyInput {
  id: Guid
}

export interface CustomerInput {
  name: string
  address: string
  phone: string
  email: string
  profitPercent?: number | null
  isActive: boolean
}
export interface Customer extends CustomerInput {
  id: Guid
}

export interface PaperInput {
  name: string
  paperType: string
  gsm: number
  sheetWidthIn: number
  sheetHeightIn: number
  unit: PaperUnit
  pricePerUnit: number
  /** ISO date, e.g. "2026-11-01". */
  effectiveFrom: string
  isActive: boolean
}
export interface Paper extends PaperInput {
  id: Guid
  /** Computed by the API. */
  rimWeightKg: number
  /** Computed by the API. */
  pricePerKg: number
}

export interface PressRateSlab {
  /** null = "and above". */
  upToImpressionsPerPlate?: number | null
  chargeType: PressChargeType
  rate: number
}
export interface PressInput {
  name: string
  sheetWidthIn: number
  sheetHeightIn: number
  piecesPerParentSheet: number
  platePrice: number
  makeReadySheetsPerPlate: number
  formaPerPlate: number
  isActive: boolean
  rateSlabs: PressRateSlab[]
}
export interface Press extends PressInput {
  id: Guid
}

export interface FinishingOperationInput {
  name: string
  basis: FinishingBasis
  rate: number
  isActive: boolean
}
export interface FinishingOperation extends FinishingOperationInput {
  id: Guid
}

export interface BindingRateSlab {
  /** null = "and above". */
  upToForma?: number | null
  ratePerPiece: number
}
export interface BindingTypeInput {
  name: string
  isActive: boolean
  slabs: BindingRateSlab[]
}
export interface BindingType extends BindingTypeInput {
  id: Guid
}

export interface ProfitRuleInput {
  name: string
  priority: number
  maxQuantity?: number | null
  profitPercent: number
  isActive: boolean
}
export interface ProfitRule extends ProfitRuleInput {
  id: Guid
}

export interface FinishingSelection {
  finishingOperationId: Guid
  /** Used by per-square-inch operations (1 or 2). */
  sides?: number | null
}

export interface TemplateField {
  fieldKey: TemplateFieldKey
  behaviour: FieldBehaviour
  defaultValue?: string | null
  allowedValues?: string | null
  min?: number | null
  max?: number | null
  step?: number | null
}

export interface TemplateComponent {
  name: string
  measure: ComponentMeasure
  sortOrder: number
  countsTowardBindingForma: boolean
  defaultFinishing: FinishingSelection[]
  fields: TemplateField[]
}

export interface TemplateExtra {
  finishingOperationId: Guid
  defaultAmount?: number | null
}

export interface ProductTemplateInput {
  name: string
  description: string
  defaultPageWidthIn?: number | null
  defaultPageHeightIn?: number | null
  defaultBindingTypeId?: Guid | null
  profitPercent?: number | null
  isActive: boolean
  components: TemplateComponent[]
  extras: TemplateExtra[]
}
export interface ProductTemplate extends ProductTemplateInput {
  id: Guid
}

export interface AppSettings {
  rimRoundingStep: number
  defaultCommissionPercent: number
  defaultOverheadPercent: number
  defaultMarketingPercent: number
}

// ---------- Costing (4.1, 4.4, 6.2) ----------

export interface ComponentSpec {
  name: string
  measure: ComponentMeasure
  paperId: Guid
  pressId: Guid
  // forma measure
  forma?: number | null
  colors?: number | null
  halfFormaPressId?: Guid | null
  countsTowardBindingForma: boolean
  // ups measure
  openWidthIn?: number | null
  openHeightIn?: number | null
  colorsFront?: number | null
  colorsBack?: number | null
  finishing: FinishingSelection[]
}

export interface JobExtra {
  finishingOperationId: Guid
  amount?: number | null
}

export interface JobSpec {
  quantity: number
  pageWidthIn?: number | null
  pageHeightIn?: number | null
  components: ComponentSpec[]
  bindingTypeId?: Guid | null
  extras: JobExtra[]
  commissionPercent: number
  overheadPercent: number
  marketingPercent: number
  profitPercentOverride?: number | null
  customerId?: Guid | null
  templateId?: Guid | null
}

export interface CostLine {
  sl: number
  category: CostLineCategory
  description: string
  quantity: number
  unit: string
  rate: number
  total: number
  component?: string | null
}

export interface CostSheet {
  quantity: number
  descriptionLines: string[]
  lines: CostLine[]
  rawMaterialsTotal: number
  conversionTotal: number
  productionCost: number
  commission: number
  overhead: number
  marketing: number
  totalCost: number
  profitPercent: number
  profitSource: string
  profit: number
  totalBill: number
  ratePerPiece: number
  trace: string[]
  warnings: string[]
}

export interface QuantityBreak {
  quantity: number
  profitPercent: number
  totalBill: number
  ratePerPiece: number
}

export interface CalculateRequest {
  spec: JobSpec
  breakQuantities?: number[]
}

export interface CalculateResponse {
  costSheet: CostSheet
  breaks: QuantityBreak[]
}

// ---------- Quotations (6.3) ----------

export interface QuotationSummary {
  id: Guid
  number: string
  jobName: string
  customerId: Guid
  customerName: string
  companyId: Guid
  companyName: string
  templateId?: Guid | null
  templateName?: string | null
  quantity: number
  totalBill: number
  ratePerPiece: number
  status: QuotationStatus
  currentVersion: number
  updatedAt: string
}

export interface QuotationVersion {
  versionNumber: number
  note?: string | null
  createdAt: string
  spec: JobSpec
  costSheet: CostSheet
}

export interface QuotationDetail extends QuotationSummary {
  /** Newest first. */
  versions: QuotationVersion[]
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface QuotationListParams {
  status?: QuotationStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface CreateQuotationRequest {
  jobName: string
  customerId: Guid
  companyId: Guid
  templateId?: Guid | null
  spec: JobSpec
  note?: string | null
}

export interface AddVersionRequest {
  jobName?: string | null
  spec: JobSpec
  note?: string | null
}

export interface UpdateStatusRequest {
  status: QuotationStatus
}
