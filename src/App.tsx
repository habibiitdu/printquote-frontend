import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { DashboardPage } from './pages/DashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { QuotationsPage } from './pages/QuotationsPage'
import { QuotationDetailPage } from './pages/detail/QuotationDetailPage'
import { QuoteBuilderPage } from './pages/quote/QuoteBuilderPage'
import { CompaniesPage } from './pages/settings/CompaniesPage'
import { CustomersPage } from './pages/settings/CustomersPage'
import { FinishingPage } from './pages/settings/finishing/FinishingPage'
import { PapersPage } from './pages/settings/PapersPage'
import { PressesPage } from './pages/settings/PressesPage'
import { TemplatesPage } from './pages/settings/templates/TemplatesPage'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="quotations" element={<QuotationsPage />} />
        <Route path="quotations/new" element={<QuoteBuilderPage />} />
        <Route path="quotations/:id" element={<QuotationDetailPage />} />
        <Route path="quotations/:id/edit" element={<QuoteBuilderPage />} />
        <Route path="settings/papers" element={<PapersPage />} />
        <Route path="settings/presses" element={<PressesPage />} />
        <Route path="settings/finishing" element={<FinishingPage />} />
        <Route path="settings/templates" element={<TemplatesPage />} />
        <Route path="settings/customers" element={<CustomersPage />} />
        <Route path="settings/companies" element={<CompaniesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
