import { Scissors } from 'lucide-react'
import { bindingTypesApi, finishingOperationsApi, profitRulesApi } from '../../../api/masterData'
import { CrudSection } from '../../../components/CrudSection'
import { PageHeader } from '../../../components/PageHeader'
import { formatPercent, formatQuantity, formatRate } from '../../../lib/format'
import { basisLabel } from '../../../lib/labels'
import { BindingTypeForm } from './BindingTypeForm'
import { FinishingOperationForm } from './FinishingOperationForm'
import { ProfitRuleForm } from './ProfitRuleForm'
import { SettingsCard } from './SettingsCard'

export function FinishingPage() {
  return (
    <>
      <PageHeader
        icon={Scissors}
        eyebrow="Configuration"
        title="Finishing, binding & pricing"
        description="Each operation has a cost basis: per piece, per 1,000, per square inch, or a fixed amount. Binding rates step by book thickness in forma."
      />
      <CrudSection
        resource={finishingOperationsApi}
        title="Finishing operations"
        noun="operation"
        columns={[
          { header: 'Cost basis', cell: (o) => <span className="chip">{basisLabel[o.basis]}</span> },
          { header: 'Rate', num: true, cell: (o) => formatRate(o.rate) },
        ]}
        Form={FinishingOperationForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
      <CrudSection
        resource={bindingTypesApi}
        title="Binding"
        noun="binding"
        description="Rate per copy by the forma of components that count toward binding."
        columns={[
          {
            header: 'Slabs (up to forma → per copy)',
            cell: (b) =>
              b.slabs.length === 0
                ? '—'
                : b.slabs
                    .map((s) => `${s.upToForma == null ? 'over' : `≤${formatQuantity(s.upToForma)}`}: ${formatRate(s.ratePerPiece)}`)
                    .join(' · '),
          },
        ]}
        Form={BindingTypeForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
      <CrudSection
        resource={profitRulesApi}
        title="Profit rules"
        noun="rule"
        description="Used when neither the job, the customer nor the template sets a profit %. Lowest priority number is tried first."
        columns={[
          { header: 'Priority', num: true, cell: (r) => r.priority },
          { header: 'Up to quantity', num: true, cell: (r) => (r.maxQuantity == null ? 'Any' : formatQuantity(r.maxQuantity)) },
          { header: 'Profit', num: true, cell: (r) => formatPercent(r.profitPercent) },
        ]}
        Form={ProfitRuleForm}
        sort={(a, b) => a.priority - b.priority}
      />
      <SettingsCard />
    </>
  )
}
