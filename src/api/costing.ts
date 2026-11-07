import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from './client'
import type { CalculateRequest, CalculateResponse } from './types'

export function calculate(request: CalculateRequest, signal?: AbortSignal) {
  return api.post<CalculateResponse>('/costing/calculate', request, signal)
}

/** Live calculation. Pass null while the spec is incomplete; no request is made then. */
export function useCalculate(request: CalculateRequest | null) {
  return useQuery({
    queryKey: ['calculate', request],
    queryFn: ({ signal }) => calculate(request as CalculateRequest, signal),
    enabled: request !== null,
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
  })
}
