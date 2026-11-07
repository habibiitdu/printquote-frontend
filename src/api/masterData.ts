import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import { crud, useCrudList } from './crud'
import type {
  AppSettings,
  BindingType,
  BindingTypeInput,
  Company,
  CompanyInput,
  Customer,
  CustomerInput,
  FinishingOperation,
  FinishingOperationInput,
  Paper,
  PaperInput,
  Press,
  PressInput,
  ProductTemplate,
  ProductTemplateInput,
  ProfitRule,
  ProfitRuleInput,
} from './types'

export const companiesApi = crud<Company, CompanyInput>('companies')
export const customersApi = crud<Customer, CustomerInput>('customers')
export const papersApi = crud<Paper, PaperInput>('papers')
export const pressesApi = crud<Press, PressInput>('presses')
export const finishingOperationsApi = crud<FinishingOperation, FinishingOperationInput>('finishing-operations')
export const bindingTypesApi = crud<BindingType, BindingTypeInput>('binding-types')
export const profitRulesApi = crud<ProfitRule, ProfitRuleInput>('profit-rules')
export const templatesApi = crud<ProductTemplate, ProductTemplateInput>('templates')

export const useCompanies = () => useCrudList(companiesApi)
export const useCustomers = () => useCrudList(customersApi)
export const usePapers = () => useCrudList(papersApi)
export const usePresses = () => useCrudList(pressesApi)
export const useFinishingOperations = () => useCrudList(finishingOperationsApi)
export const useBindingTypes = () => useCrudList(bindingTypesApi)
export const useProfitRules = () => useCrudList(profitRulesApi)
export const useTemplates = () => useCrudList(templatesApi)

// Settings is a single row: GET /settings and PUT /settings.
const SETTINGS_KEY = ['settings']

export function useSettings() {
  return useQuery({ queryKey: SETTINGS_KEY, queryFn: () => api.get<AppSettings>('/settings') })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AppSettings) => api.put<AppSettings>('/settings', input),
    onSuccess: (data) => qc.setQueryData(SETTINGS_KEY, data),
  })
}
