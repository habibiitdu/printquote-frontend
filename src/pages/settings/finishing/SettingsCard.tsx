import { useState, type FormEvent } from 'react'
import { fieldErrors } from '../../../api/client'
import { useSaveSettings, useSettings } from '../../../api/masterData'
import type { AppSettings } from '../../../api/types'
import { NumberField } from '../../../components/form/Fields'
import { ProblemBanner } from '../../../components/ProblemBanner'
import { QueryState } from '../../../components/QueryState'
import { requiredNumber, toInput } from '../../../lib/numbers'

/** GET/PUT /settings: rim rounding and the default overhead percentages. */
export function SettingsCard() {
  const settings = useSettings()
  return (
    <section className="card" aria-labelledby="settings-h" style={{ maxWidth: 760 }}>
      <h2 id="settings-h" className="card-title">
        Settings
      </h2>
      <QueryState isLoading={settings.isLoading} error={settings.error}>
        {settings.data && <SettingsForm initial={settings.data} />}
      </QueryState>
    </section>
  )
}

function SettingsForm({ initial }: { initial: AppSettings }) {
  const save = useSaveSettings()
  const [rim, setRim] = useState(toInput(initial.rimRoundingStep))
  const [commission, setCommission] = useState(toInput(initial.defaultCommissionPercent))
  const [overhead, setOverhead] = useState(toInput(initial.defaultOverheadPercent))
  const [marketing, setMarketing] = useState(toInput(initial.defaultMarketingPercent))
  const err = (f: string) => fieldErrors(save.error, f)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    save.mutate({
      rimRoundingStep: requiredNumber(rim),
      defaultCommissionPercent: requiredNumber(commission),
      defaultOverheadPercent: requiredNumber(overhead),
      defaultMarketingPercent: requiredNumber(marketing),
    })
  }

  return (
    <form className="stack" onSubmit={submit}>
      <ProblemBanner error={save.error} heading="Settings not saved" />
      <div className="grid2">
        <NumberField label="Rim rounding step" value={rim} onChange={setRim} min={0} step="any" required errors={err('rimRoundingStep')} hint="Paper by the rim rounds up to this step (0.05)." />
        <NumberField label="Default sales commission %" value={commission} onChange={setCommission} min={0} required errors={err('defaultCommissionPercent')} />
        <NumberField label="Default salary, wages & overhead %" value={overhead} onChange={setOverhead} min={0} required errors={err('defaultOverheadPercent')} />
        <NumberField label="Default marketing & sales %" value={marketing} onChange={setMarketing} min={0} required errors={err('defaultMarketingPercent')} />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-p" disabled={save.isPending}>
          {save.isPending ? 'Saving…' : 'Save settings'}
        </button>
        {save.isSuccess && (
          <span className="small muted" role="status">
            Saved.
          </span>
        )}
      </div>
    </form>
  )
}
