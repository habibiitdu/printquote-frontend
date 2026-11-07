import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../../api/client'
import type { ProfitRule, ProfitRuleInput } from '../../../api/types'
import { FormActions, type EntityFormProps } from '../../../components/CrudSection'
import { CheckboxField, NumberField, TextField } from '../../../components/form/Fields'
import { ProblemBanner } from '../../../components/ProblemBanner'
import { requiredNumber, toInput, toNumber } from '../../../lib/numbers'

export function ProfitRuleForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<ProfitRule, ProfitRuleInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [priority, setPriority] = useState(toInput(initial?.priority ?? 1))
  const [maxQuantity, setMaxQuantity] = useState(toInput(initial?.maxQuantity))
  const [profit, setProfit] = useState(toInput(initial?.profitPercent))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const err = (f: string) => fieldErrors(error, f)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({
      name: name.trim(),
      priority: requiredNumber(priority),
      maxQuantity: toNumber(maxQuantity),
      profitPercent: requiredNumber(profit),
      isActive,
    })
  }
  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={err('name')} placeholder="e.g. Up to 5,000 pcs" />
      <div className="grid2">
        <NumberField label="Priority" value={priority} onChange={setPriority} step={1} required errors={err('priority')} hint="Lower is tried first." />
        <NumberField label="Up to quantity" value={maxQuantity} onChange={setMaxQuantity} min={1} step={1} placeholder="Any" errors={err('maxQuantity')} hint="Blank = any quantity." />
        <NumberField label="Profit %" value={profit} onChange={setProfit} min={0} required errors={err('profitPercent')} />
      </div>
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
