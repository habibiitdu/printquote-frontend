/** The engine's plain-language calculation steps. */
export function TraceList({ trace }: { trace: string[] }) {
  if (trace.length === 0) return <p className="small muted">No calculation steps were returned.</p>
  return (
    <ol className="trace">
      {trace.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ol>
  )
}

export function WarningList({ warnings }: { warnings: string[] }) {
  if (warnings.length === 0) return null
  return (
    <div className="banner banner-warn" role="status">
      <p className="banner-title">Warnings from the costing engine</p>
      <ul>
        {warnings.map((w, i) => (
          <li key={i}>{w}</li>
        ))}
      </ul>
    </div>
  )
}
