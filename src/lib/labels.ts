import type {
  ComponentMeasure,
  FieldBehaviour,
  FinishingBasis,
  PaperUnit,
  PressChargeType,
  QuotationStatus,
  TemplateFieldKey,
} from '../api/types'

export const STATUSES: QuotationStatus[] = ['draft', 'sent', 'approved', 'lost']

export const statusLabel: Record<QuotationStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  lost: 'Lost',
}

export const basisLabel: Record<FinishingBasis, string> = {
  perSquareInch: 'Per sq. inch',
  perThousand: 'Per 1,000',
  perPiece: 'Per piece',
  fixed: 'Fixed',
}

export const chargeTypeLabel: Record<PressChargeType, string> = {
  flatPerPlate: 'Flat per plate',
  perThousand: 'Per 1,000 impressions',
}

export const unitLabel: Record<PaperUnit, string> = {
  rim: 'Rim (500 sheets)',
  sheet: 'Sheet',
}

export const measureLabel: Record<ComponentMeasure, string> = {
  forma: 'Forma (pages)',
  ups: 'Flat piece (ups)',
}

export const behaviourLabel: Record<FieldBehaviour, string> = {
  ask: 'Ask',
  default: 'Default',
  locked: 'Locked',
}

export const fieldLabel: Record<TemplateFieldKey, string> = {
  forma: 'Forma',
  colors: 'Colours (both sides)',
  paperId: 'Paper / stock',
  pressId: 'Press',
  halfFormaPressId: 'Half-forma press',
  openWidthIn: 'Open width (in)',
  openHeightIn: 'Open height (in)',
  colorsFront: 'Colours front',
  colorsBack: 'Colours back',
}

export const FORMA_FIELDS: TemplateFieldKey[] = ['forma', 'colors', 'paperId', 'pressId', 'halfFormaPressId']
export const UPS_FIELDS: TemplateFieldKey[] = [
  'openWidthIn',
  'openHeightIn',
  'colorsFront',
  'colorsBack',
  'paperId',
  'pressId',
]
export const ALL_FIELDS: TemplateFieldKey[] = [
  'forma',
  'colors',
  'paperId',
  'pressId',
  'halfFormaPressId',
  'openWidthIn',
  'openHeightIn',
  'colorsFront',
  'colorsBack',
]

export const fieldsForMeasure = (m: ComponentMeasure) => (m === 'forma' ? FORMA_FIELDS : UPS_FIELDS)

/** Quantity breaks priced alongside every calculation. */
export const BREAK_QUANTITIES = [1000, 2500, 10000, 20000, 25000]
