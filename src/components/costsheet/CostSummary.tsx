import type { CostSheet } from '../../api/types'
import { formatMoney, formatPercent } from '../../lib/format'

/** Production cost down to rate per piece, as a compact list (the builder's right column). */
export function CostSummary({ sheet }: { sheet: CostSheet }) {
  const rows: [string, string][] = [
    ['Production cost', formatMoney(sheet.productionCost)],
    ['Sales commission', formatMoney(sheet.commission)],
    ['Salary, wages & overhead', formatMoney(sheet.overhead)],
    ['Marketing & sales', formatMoney(sheet.marketing)],
    ['Total cost', formatMoney(sheet.totalCost)],
    [
      `Profit (${formatPercent(sheet.profitPercent)}${sheet.profitSource ? `, ${sheet.profitSource.replace(':', ': ')}` : ''})`,
      formatMoney(sheet.profit),
    ],
  ]
  return (
    <div className="summary">
      {rows.map(([label, value]) => (
        <div className="summary-row" key={label}>
          <span>{label}</span>
          <span className="num">{value}</span>
        </div>
      ))}
      <div className="summary-row summary-total">
        <span>Total bill</span>
        <span className="num">{formatMoney(sheet.totalBill)}</span>
      </div>
      <div className="rate-box">
        <span>
          Rate per piece
          <span>{formatMoney(sheet.totalBill)} ÷ {sheet.quantity.toLocaleString('en-IN')} pcs</span>
        </span>
        <span className="num">{formatMoney(sheet.ratePerPiece)}</span>
      </div>
    </div>
  )
}
