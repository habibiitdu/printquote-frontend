import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

/** A master-data resource with the standard five endpoints (design 6.1). */
export interface Crud<T, I> {
  key: string
  list(): Promise<T[]>
  get(id: string): Promise<T>
  create(input: I): Promise<T>
  update(id: string, input: I): Promise<T>
  remove(id: string): Promise<void>
}

export function crud<T, I>(resource: string): Crud<T, I> {
  const base = `/${resource}`
  return {
    key: resource,
    list: () => api.get<T[]>(base),
    get: (id) => api.get<T>(`${base}/${id}`),
    create: (input) => api.post<T>(base, input),
    update: (id, input) => api.put<T>(`${base}/${id}`, input),
    remove: (id) => api.delete(`${base}/${id}`),
  }
}

export function useCrudList<T, I>(resource: Crud<T, I>) {
  return useQuery({ queryKey: [resource.key], queryFn: resource.list })
}

export interface SaveArgs<I> {
  id?: string
  input: I
}

export function useCrudSave<T, I>(resource: Crud<T, I>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: SaveArgs<I>) => (id ? resource.update(id, input) : resource.create(input)),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource.key] }),
  })
}

export function useCrudRemove<T, I>(resource: Crud<T, I>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => resource.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource.key] }),
  })
}
