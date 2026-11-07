import { useState, type FormEvent } from 'react'
import { useQuotationBreaks } from '../../api/quotations'
import { BreaksTable } from '../../components/costsheet/BreaksTable'
import { TextField } from '../../components/form/Fields'
import { QueryState } from '../../components/QueryState'
import { BREAK_QUANTITIES } from '../../lib/labels'
import { parseQuantities } from '../../lib/numbers'

interface Props {
  quotationId: string
  version: number
  quantity: number
}

/** GET /quotations/{id}/breaks, priced with the current version's rate snapshot. */
export function BreaksPanel({ quotationId, version, quantity }: Props) {
  const [text, setText] = useState(BREAK_QUANTITIES.join(', '))
  const [quantities, setQuantities] = useState(BREAK_QUANTITIES)
  const breaks = useQuotationBreaks(quotationId, quantities, version)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseQuantities(text)
    if (parsed.length > 0) setQuantities(parsed)
  }

  return (
    <section className="card flush" aria-labelledby="breaks-h">
      <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
        <h2 id="breaks-h" className="card-title">
          Quantity breaks
        </h2>
        <p className="card-sub">Priced with the rates saved in the current version.</p>
      </div>
      <form className="card-foot" style={{ paddingBottom: 0 }} onSubmit={onSubmit}>
        <div className="inline-pair" style={{ alignItems: 'flex-end' }}>
          <TextField label="Quantities (comma separated)" value={text} onChange={setText} />
          <button type="submit" className="btn btn-s" style={{ marginBottom: 0 }}>
            Price
          </button>
        </div>
      </form>
      <QueryState isLoading={breaks.isLoading} error={breaks.error} label="Pricing breaks…">
        <BreaksTable breaks={breaks.data ?? []} highlight={quantity} />
      </QueryState>
      <div style={{ height: 6 }} />
    </section>
  )
}
