import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../api/client'
import { customersApi } from '../../api/masterData'
import type { Customer, CustomerInput } from '../../api/types'
import { CrudSection, FormActions, type EntityFormProps } from '../../components/CrudSection'
import { CheckboxField, NumberField, TextAreaField, TextField } from '../../components/form/Fields'
import { PageHeader } from '../../components/PageHeader'
import { ProblemBanner } from '../../components/ProblemBanner'
import { formatPercent } from '../../lib/format'
import { toInput, toNumber } from '../../lib/numbers'

export function CustomersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Customers"
        description="A customer with a profit % set here gets that margin ahead of the template and quantity rules."
      />
      <CrudSection
        resource={customersApi}
        title="Customers"
        noun="customer"
        columns={[
          { header: 'Address', cell: (c) => c.address },
          { header: 'Phone', cell: (c) => c.phone },
          { header: 'Email', cell: (c) => c.email },
          { header: 'Profit', num: true, cell: (c) => (c.profitPercent == null ? 'By rule' : formatPercent(c.profitPercent)) },
        ]}
        Form={CustomerForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
    </>
  )
}

function CustomerForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<Customer, CustomerInput>) {
  const [name, setName] = useState(initial?.name ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [profit, setProfit] = useState(toInput(initial?.profitPercent))
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ name: name.trim(), address, phone, email, profitPercent: toNumber(profit), isActive })
  }
  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={name} onChange={setName} required errors={fieldErrors(error, 'name')} />
      <TextAreaField label="Address" value={address} onChange={setAddress} rows={2} errors={fieldErrors(error, 'address')} />
      <div className="grid2">
        <TextField label="Phone" type="tel" value={phone} onChange={setPhone} errors={fieldErrors(error, 'phone')} />
        <TextField label="Email" type="email" value={email} onChange={setEmail} errors={fieldErrors(error, 'email')} />
      </div>
      <NumberField
        label="Profit % (blank = use rules)"
        value={profit}
        onChange={setProfit}
        min={0}
        step="any"
        errors={fieldErrors(error, 'profitPercent')}
      />
      <CheckboxField label="Active" checked={isActive} onChange={setIsActive} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
