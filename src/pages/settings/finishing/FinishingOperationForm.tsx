import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../../api/client'
import type { FinishingBasis, FinishingOperation, FinishingOperationInput } from '../../../api/types'
import { FormActions, type EntityFormProps } from '../../../components/CrudSection'
import { CheckboxField, NumberField, SelectField, TextField } from '../../../components/form/Fields'
import { ProblemBanner } from '../../../components/ProblemBanner'
import { basisLabel } from '../../../lib/labels'
import { requiredNumber, toInput } from '../../../lib/numbers'

const BASES: FinishingBasis[] = ['perSquareInch', 'perThousand', 'perPiece', 'fixed']

const BASIS_HINT: Record<FinishingBasis, string> = {
  perSquareInch: 'Quantity = area × copies × sides.',
  perThousand: 'Quantity = copies ÷ 1,000.',
  perPiece: 'Quantity = copies.',
  fixed: 'One amount per job; a quote can override it.',
}

export function FinishingOperationForm({
  initial,
  saving,
  error,
  onSubmit,
  onCancel,
}: EntityFormProps<FinishingOperation, FinishingOperationInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [basis, setBasis] = useState<FinishingBasis>(initial?.basis ?? 'perThousand')
  const [rate, setRate] = useState(toInput(initial?.rate))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), basis, rate: requiredNumber(rate), isActive })
  }
  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={fieldErrors(error, 'name')} />
      <div className="grid2">
        <SelectField
          label="Cost basis"
          value={basis}
          onChange={(v) => setBasis(v as FinishingBasis)}
          options={BASES.map((b) => ({ value: b, label: basisLabel[b] }))}
          hint={BASIS_HINT[basis]}
          errors={fieldErrors(error, 'basis')}
        />
        <NumberField label="Rate" value={rate} onChange={setRate} min={0} required errors={fieldErrors(error, 'rate')} />
      </div>
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
