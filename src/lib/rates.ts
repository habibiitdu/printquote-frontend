import type { PressRateSlab } from '../api/types'

/** 1 square inch in square metres. */
export const SQ_IN_TO_M2 = 0.00064516
export const SHEETS_PER_RIM = 500

/** Rim weight in kg: width × height (in) × 0.00064516 m² × gsm × 500 sheets / 1000. */
export function rimWeightKg(widthIn: number, heightIn: number, gsm: number): number {
  return (widthIn * heightIn * SQ_IN_TO_M2 * gsm * SHEETS_PER_RIM) / 1000
}

/** Price per rim from a market price per kg. */
export function pricePerRimFromKg(widthIn: number, heightIn: number, gsm: number, pricePerKg: number): number {
  return Math.round(rimWeightKg(widthIn, heightIn, gsm) * pricePerKg * 100) / 100
}

/** Slabs ordered by upToImpressionsPerPlate ascending, "and above" (null) last. */
export function sortPressSlabs<T extends Pick<PressRateSlab, 'upToImpressionsPerPlate'>>(slabs: T[]): T[] {
  return [...slabs].sort((a, b) => {
    const x = a.upToImpressionsPerPlate ?? Number.POSITIVE_INFINITY
    const y = b.upToImpressionsPerPlate ?? Number.POSITIVE_INFINITY
    return x - y
  })
}

/**
 * The slab a given impressions-per-plate value falls into (design 4.3):
 * the first slab, in ascending order, where upTo is null or perPlate ≤ upTo.
 * Display only; the API does the real pricing.
 */
export function findPressSlab<T extends Pick<PressRateSlab, 'upToImpressionsPerPlate'>>(
  slabs: T[],
  impressionsPerPlate: number,
): T | undefined {
  return sortPressSlabs(slabs).find(
    (s) => s.upToImpressionsPerPlate === null || s.upToImpressionsPerPlate === undefined || impressionsPerPlate <= s.upToImpressionsPerPlate,
  )
}
