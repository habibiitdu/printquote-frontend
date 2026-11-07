import type { QuantityBreak } from '../../api/types'
import { formatMoney, formatPercent, formatQuantity } from '../../lib/format'

export function BreaksTable({ breaks, highlight }: { breaks: QuantityBreak[]; highlight?: number }) {
  if (breaks.length === 0) return <p className="empty">No quantity breaks.</p>
  return (
    <div className="scroll-x">
      <table className="tbl">
        <caption className="sr-only">Quantity breaks</caption>
        <thead>
          <tr>
            <th scope="col" className="num">
              Quantity
            </th>
            <th scope="col" className="num">
              Profit
            </th>
            <th scope="col" className="num">
              Total bill
            </th>
            <th scope="col" className="num">
              Rate / pc
            </th>
          </tr>
        </thead>
        <tbody>
          {breaks.map((b) => (
            <tr key={b.quantity} className={b.quantity === highlight ? 'sel' : undefined}>
              <td className="num">{formatQuantity(b.quantity)}</td>
              <td className="num">{formatPercent(b.profitPercent)}</td>
              <td className="num">{formatMoney(b.totalBill)}</td>
              <td className="num" style={{ fontWeight: 600 }}>
                {formatMoney(b.ratePerPiece)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
