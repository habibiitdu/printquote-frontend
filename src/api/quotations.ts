import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type {
  AddVersionRequest,
  CreateQuotationRequest,
  PagedResult,
  QuantityBreak,
  QuotationDetail,
  QuotationListParams,
  QuotationStatus,
  QuotationSummary,
} from './types'

const KEY = 'quotations'

function listPath(params: QuotationListParams): string {
  const q = new URLSearchParams()
  if (params.status) q.set('status', params.status)
  if (params.search) q.set('search', params.search)
  q.set('page', String(params.page ?? 1))
  q.set('pageSize', String(params.pageSize ?? 20))
  return `/quotations?${q.toString()}`
}

export const quotationsApi = {
  list: (params: QuotationListParams, signal?: AbortSignal) =>
    api.get<PagedResult<QuotationSummary>>(listPath(params), signal),
  get: (id: string, signal?: AbortSignal) => api.get<QuotationDetail>(`/quotations/${id}`, signal),
  create: (body: CreateQuotationRequest) => api.post<QuotationDetail>('/quotations', body),
  addVersion: (id: string, body: AddVersionRequest) =>
    api.post<QuotationDetail>(`/quotations/${id}/versions`, body),
  setStatus: (id: string, status: QuotationStatus) =>
    api.put<QuotationDetail>(`/quotations/${id}/status`, { status }),
  breaks: async (id: string, quantities: number[], signal?: AbortSignal): Promise<QuantityBreak[]> => {
    const data = await api.get<QuantityBreak[] | { breaks: QuantityBreak[] }>(
      `/quotations/${id}/breaks?quantities=${quantities.join(',')}`,
      signal,
    )
    // The contract does not spell out the envelope: accept a bare array or { breaks }.
    return Array.isArray(data) ? data : data.breaks
  },
}

export function useQuotationList(params: QuotationListParams) {
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: ({ signal }) => quotationsApi.list(params, signal),
  })
}

export function useQuotation(id: string | undefined) {
  return useQuery({
    queryKey: [KEY, 'detail', id],
    queryFn: ({ signal }) => quotationsApi.get(id as string, signal),
    enabled: Boolean(id),
  })
}

export function useQuotationBreaks(id: string, quantities: number[], version: number) {
  return useQuery({
    // The version is in the key so a new version re-prices the breaks.
    queryKey: [KEY, 'breaks', id, version, quantities],
    queryFn: ({ signal }) => quotationsApi.breaks(id, quantities, signal),
    enabled: quantities.length > 0,
    retry: false,
  })
}

function useSaveQuotation<A>(fn: (args: A) => Promise<QuotationDetail>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      qc.setQueryData([KEY, 'detail', data.id], data)
      return qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export const useCreateQuotation = () => useSaveQuotation(quotationsApi.create)

export const useAddVersion = () =>
  useSaveQuotation(({ id, body }: { id: string; body: AddVersionRequest }) => quotationsApi.addVersion(id, body))

export const useSetStatus = () =>
  useSaveQuotation(({ id, status }: { id: string; status: QuotationStatus }) =>
    quotationsApi.setStatus(id, status),
  )
