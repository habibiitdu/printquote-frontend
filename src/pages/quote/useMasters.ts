import {
  useBindingTypes,
  useCompanies,
  useCustomers,
  useFinishingOperations,
  usePapers,
  usePresses,
  useSettings,
  useTemplates,
} from '../../api/masterData'
import type { Masters } from '../../lib/quoteDraft'

/** Every master list the quote builder needs, loaded together. */
export function useMasters(): { data: Masters | undefined; isLoading: boolean; error: unknown } {
  const companies = useCompanies()
  const customers = useCustomers()
  const papers = usePapers()
  const presses = usePresses()
  const finishingOps = useFinishingOperations()
  const bindingTypes = useBindingTypes()
  const templates = useTemplates()
  const settings = useSettings()

  const all = [companies, customers, papers, presses, finishingOps, bindingTypes, templates, settings]
  const error = all.find((q) => q.error)?.error ?? null
  const isLoading = all.some((q) => q.isLoading)

  const data =
    companies.data &&
    customers.data &&
    papers.data &&
    presses.data &&
    finishingOps.data &&
    bindingTypes.data &&
    templates.data &&
    settings.data
      ? {
          companies: companies.data,
          customers: customers.data,
          papers: papers.data,
          presses: presses.data,
          finishingOps: finishingOps.data,
          bindingTypes: bindingTypes.data,
          templates: templates.data,
          settings: settings.data,
        }
      : undefined

  return { data, isLoading, error }
}
