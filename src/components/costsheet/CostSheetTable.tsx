import type { CostLine, CostSheet } from '../../api/types'
import { formatMoney, formatPercent, formatQuantity, formatRate } from '../../lib/format'

interface Props {
  sheet: CostSheet
  /**
   * compact: the builder's live table (lines and subtotals).
   * excel: the internal cost sheet layout, with the summary rows inside the table.
   */
  variant: 'compact' | 'excel'
  caption?: string
}

/** The SL / Descriptions / Quantity / Unit / Rate / Total table, grouped as in the press's Excel sheets. */
export function CostSheetTable({ sheet, variant, caption }: Props) {
  const raw = sheet.lines.filter((l) => l.category === 'rawMaterial')
  const conv = sheet.lines.filter((l) => l.category === 'conversion')
  const excel = variant === 'excel'
  const subClass = excel ? 'tot' : 'sub'

  return (
    <div className="scroll-x">
      <table className={excel ? 'sheet' : 'tbl'}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            <th scope="col">SL</th>
            <th scope="col">{excel ? 'Descriptions' : 'Description'}</th>
            <th scope="col" className="num">
              Quantity
            </th>
            <th scope="col">Unit</th>
            <th scope="col" className="num">
              Rate
            </th>
            <th scope="col" className="num">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {raw.map((l) => (
            <LineRow key={l.sl} line={l} />
          ))}
          <SubRow className={subClass} center={excel} label={excel ? 'Total raw materials cost' : 'Total raw materials'} value={sheet.rawMaterialsTotal} />
          {conv.map((l) => (
            <LineRow key={l.sl} line={l} />
          ))}
          <SubRow
            className={subClass}
            center={excel}
            label={excel ? 'Total printing, binding, packing & delivery cost' : 'Total printing, binding, packing & delivery'}
            value={sheet.conversionTotal}
          />
          {excel && <ExcelSummaryRows sheet={sheet} />}
        </tbody>
      </table>
    </div>
  )
}

function LineRow({ line }: { line: CostLine }) {
  return (
    <tr>
      <td>{line.sl}</td>
      <td>{line.description}</td>
      <td className="num">{formatQuantity(line.quantity)}</td>
      <td>{line.unit}</td>
      <td className="num">{formatRate(line.rate)}</td>
      <td className="num">{formatMoney(line.total)}</td>
    </tr>
  )
}

function SubRow({
  label,
  value,
  className,
  center,
  bold,
}: {
  label: string
  value: number
  className?: string
  center?: boolean
  bold?: boolean
}) {
  return (
    <tr className={className}>
      <td></td>
      <td colSpan={4} className={center ? 'center' : undefined}>
        {label}
      </td>
      <td className="num" style={bold ? { fontWeight: 700 } : undefined}>
        {formatMoney(value)}
      </td>
    </tr>
  )
}

function ExcelSummaryRows({ sheet }: { sheet: CostSheet }) {
  return (
    <>
      <SubRow center label="Total production cost" value={sheet.productionCost} />
      <SubRow center label="Sales commission" value={sheet.commission} />
      <SubRow center label="Salary, wages & overhead cost" value={sheet.overhead} />
      <SubRow center label="Marketing & sales expense" value={sheet.marketing} />
      <SubRow center label="Total cost" value={sheet.totalCost} />
      <SubRow className="tot" center label={`Profit (${formatPercent(sheet.profitPercent)})`} value={sheet.profit} />
      <SubRow className="bill" center label="Total bill" value={sheet.totalBill} />
      <SubRow center bold label="Rate (per pcs)" value={sheet.ratePerPiece} />
    </>
  )
}
