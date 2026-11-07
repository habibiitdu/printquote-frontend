import type { CostSheet } from '../../api/types'
import { formatMoney, formatQuantity } from '../../lib/format'
import { CostSheetTable } from './CostSheetTable'

interface Party {
  companyName: string
  customerName: string
  customerAddress?: string
  jobName: string
}

/** Letterhead, party, job, description lines and quantity: the top of the Excel sheet. */
function SheetHeader({ party, sheet }: { party: Party; sheet: CostSheet }) {
  const lines = sheet.descriptionLines.length > 0 ? sheet.descriptionLines : ['—']
  return (
    <div className="scroll-x">
      <table className="sheet">
        <tbody>
          <tr>
            <td colSpan={6} className="letterhead">
              {party.companyName}
            </td>
          </tr>
          <tr>
            <th scope="row">Party name</th>
            <td colSpan={2}>{party.customerName}</td>
            <th scope="row">Address</th>
            <td colSpan={2}>{party.customerAddress || '—'}</td>
          </tr>
          <tr>
            <th scope="row">Name</th>
            <td colSpan={5} style={{ fontWeight: 600 }}>
              {party.jobName}
            </td>
          </tr>
          {lines.map((line, i) => (
            <tr key={i}>
              {i === 0 && (
                <th scope="row" rowSpan={lines.length}>
                  Description
                </th>
              )}
              <td colSpan={5}>{line}</td>
            </tr>
          ))}
          <tr>
            <th scope="row">Quantity</th>
            <td colSpan={5} style={{ fontWeight: 600 }}>
              {formatQuantity(sheet.quantity)} pcs
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/** The internal cost sheet, laid out like the press's Excel sheets. */
export function InternalCostSheet({ party, sheet }: { party: Party; sheet: CostSheet }) {
  return (
    <div className="stack">
      <SheetHeader party={party} sheet={sheet} />
      <CostSheetTable sheet={sheet} variant="excel" caption="Internal cost sheet" />
    </div>
  )
}

/** What the customer sees: one item row and the terms. */
export function CustomerQuotation({ party, sheet }: { party: Party; sheet: CostSheet }) {
  const description = [party.jobName, sheet.descriptionLines.join(', ')].filter(Boolean).join(': ')
  return (
    <div className="stack">
      <div className="scroll-x">
        <table className="sheet">
          <tbody>
            <tr>
              <td colSpan={5} className="letterhead">
                {party.companyName}
              </td>
            </tr>
            <tr>
              <th scope="row">To</th>
              <td colSpan={4}>
                {party.customerName}
                {party.customerAddress ? `, ${party.customerAddress}` : ''}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="scroll-x">
        <table className="sheet">
          <caption className="sr-only">Customer quotation</caption>
          <thead>
            <tr>
              <th scope="col">SL</th>
              <th scope="col">Item</th>
              <th scope="col" className="num">
                Quantity
              </th>
              <th scope="col" className="num">
                Rate (per pc)
              </th>
              <th scope="col" className="num">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{description}</td>
              <td className="num">{formatQuantity(sheet.quantity)}</td>
              <td className="num">{formatMoney(sheet.ratePerPiece)}</td>
              <td className="num">{formatMoney(sheet.totalBill)}</td>
            </tr>
            <tr className="bill">
              <td></td>
              <td colSpan={3} style={{ textAlign: 'right' }}>
                Total
              </td>
              <td className="num">{formatMoney(sheet.totalBill)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="terms">
        <p style={{ fontWeight: 600 }}>Terms</p>
        <p>
          Valid for [VALIDITY DAYS] days. Paper prices may change with the market. Delivery within [DELIVERY DAYS] days
          of artwork approval. [PAYMENT TERMS].
        </p>
      </div>
    </div>
  )
}
