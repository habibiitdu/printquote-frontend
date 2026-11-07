import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../api/client'
import { companiesApi } from '../../api/masterData'
import type { Company, CompanyInput } from '../../api/types'
import { CrudSection, FormActions, type EntityFormProps } from '../../components/CrudSection'
import { CheckboxField, TextAreaField, TextField } from '../../components/form/Fields'
import { PageHeader } from '../../components/PageHeader'
import { ProblemBanner } from '../../components/ProblemBanner'

export function CompaniesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Companies"
        description="Letterheads the press quotes under. The company name is printed at the top of every cost sheet."
      />
      <CrudSection
        resource={companiesApi}
        title="Companies & letterheads"
        noun="company"
        columns={[
          { header: 'Address', cell: (c) => c.address },
          { header: 'Phone', cell: (c) => c.phone },
        ]}
        Form={CompanyForm}
        sort={(a, b) => a.name.localeCompare(b.name)}
      />
    </>
  )
}

function CompanyForm({ initial, saving, error, onSubmit, onCancel }: EntityFormProps<Company, CompanyInput>) {
  const [f, setF] = useState<CompanyInput>({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    phone: initial?.phone ?? '',
    isActive: initial?.isActive ?? true,
  })
  const set = (patch: Partial<CompanyInput>) => setF((x) => ({ ...x, ...patch }))
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit({ ...f, name: f.name.trim() })
  }
  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={error} heading="Not saved" />
      <TextField label="Name" value={f.name} onChange={(name) => set({ name })} required errors={fieldErrors(error, 'name')} />
      <TextAreaField label="Address" value={f.address} onChange={(address) => set({ address })} errors={fieldErrors(error, 'address')} rows={2} />
      <TextField label="Phone" type="tel" value={f.phone} onChange={(phone) => set({ phone })} errors={fieldErrors(error, 'phone')} />
      <CheckboxField label="Active" checked={f.isActive} onChange={(isActive) => set({ isActive })} />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
