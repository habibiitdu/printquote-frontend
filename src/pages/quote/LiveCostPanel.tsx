import { useMemo } from 'react'
import { useCalculate } from '../../api/costing'
import type { CalculateRequest, JobSpec } from '../../api/types'
import { BreaksTable } from '../../components/costsheet/BreaksTable'
import { TraceList, WarningList } from '../../components/costsheet/CostNotes'
import { CostSheetTable } from '../../components/costsheet/CostSheetTable'
import { CostSummary } from '../../components/costsheet/CostSummary'
import { IssueList, ProblemBanner } from '../../components/ProblemBanner'
import { BREAK_QUANTITIES } from '../../lib/labels'
import { useDebouncedValue } from '../../lib/useDebouncedValue'

interface Props {
  /** null while required fields are missing. */
  spec: JobSpec | null
  issues: string[]
}

/** Right column: the cost sheet from POST /costing/calculate, refreshed ~400 ms after the last spec change. */
export function LiveCostPanel({ spec, issues }: Props) {
  // Debounce the serialised request, so edits that do not change the spec (job name, note) do nothing.
  const json = spec ? JSON.stringify({ spec, breakQuantities: BREAK_QUANTITIES } satisfies CalculateRequest) : null
  const debouncedJson = useDebouncedValue(json, 400)
  const request = useMemo(
    () => (debouncedJson ? (JSON.parse(debouncedJson) as CalculateRequest) : null),
    [debouncedJson],
  )
  const calc = useCalculate(request)

  const waiting = json !== debouncedJson || calc.isFetching
  const data = calc.data
  const stale = !spec || waiting || calc.isPlaceholderData || Boolean(calc.error)
  const status = !spec ? 'Waiting for required fields' : waiting ? 'Calculating…' : data ? 'Up to date' : ''

  return (
    <aside className="col-side" aria-label="Live cost sheet">
      <section className="card flush">
        <div className="card-head">
          <h2 className="card-title">Live cost sheet</h2>
          <span className="small muted" role="status" aria-live="polite">
            {status}
          </span>
        </div>

        {(!spec || calc.error || !data) && (
          <div className="card-foot stack">
            {!spec && <IssueList title="To price this job, fill in:" issues={issues} />}
            {spec && calc.error && <ProblemBanner error={calc.error} heading="The API could not price this job" />}
            {!data && !spec && <p className="muted small">The cost sheet appears once every required field is filled.</p>}
          </div>
        )}

        {data && (
          <div className={stale ? 'stale' : undefined}>
            <CostSheetTable sheet={data.costSheet} variant="compact" caption="Live cost sheet" />
            <div className="card-foot" style={{ paddingTop: 14 }}>
              <CostSummary sheet={data.costSheet} />
            </div>
          </div>
        )}
      </section>

      {data && (
        <>
          <WarningList warnings={data.costSheet.warnings} />
          <section className="card flush">
            <div className="card-head" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
              <h2 className="card-title">Quantity breaks</h2>
              <p className="card-sub">The same job priced at other quantities, for the client to compare.</p>
            </div>
            <BreaksTable breaks={data.breaks} highlight={data.costSheet.quantity} />
            <div style={{ height: 6 }} />
          </section>
          <section className="card">
            <h2 className="card-title">How it was calculated</h2>
            <TraceList trace={data.costSheet.trace} />
          </section>
        </>
      )}
    </aside>
  )
}
