import { Plus, Trash2 } from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { useCrudList, useCrudRemove, useCrudSave, type Crud } from '../api/crud'
import { Drawer } from './Drawer'
import { ProblemBanner } from './ProblemBanner'
import { QueryState } from './QueryState'

export interface Column<T> {
  header: string
  cell: (row: T) => ReactNode
  num?: boolean
}

/** Props every master-data edit form receives. */
export interface EntityFormProps<T, I> {
  /** null when creating. */
  initial: T | null
  saving: boolean
  error: unknown
  onSubmit: (input: I) => void
  onCancel: () => void
}

interface Row {
  id: string
  name: string
  isActive?: boolean
}

interface Props<T extends Row, I> {
  resource: Crud<T, I>
  title: string
  /** Singular noun for buttons, e.g. "paper". */
  noun: string
  description?: ReactNode
  columns: Column<T>[]
  Form: ComponentType<EntityFormProps<T, I>>
  sort?: (a: T, b: T) => number
  /** Open the editor in a wider drawer (for big editors). */
  wide?: boolean
  footer?: ReactNode
}

/** A master-data table with an add button and a slide-over drawer to create, edit or delete a row. */
export function CrudSection<T extends Row, I>({
  resource,
  title,
  noun,
  description,
  columns,
  Form,
  sort,
  wide,
  footer,
}: Props<T, I>) {
  const list = useCrudList(resource)
  const save = useCrudSave(resource)
  const remove = useCrudRemove(resource)
  const [selected, setSelected] = useState<string | null>(null)

  const rows = sort ? [...(list.data ?? [])].sort(sort) : (list.data ?? [])
  const current = selected && selected !== 'new' ? (rows.find((r) => r.id === selected) ?? null) : null
  const open = selected === 'new' || current !== null

  const select = (id: string | null) => {
    save.reset()
    remove.reset()
    setSelected(id)
  }

  const onDelete = (row: T) => {
    const ok = window.confirm(
      `Delete "${row.name}"? If saved quotations use it, it is deactivated instead so they stay readable.`,
    )
    if (ok) remove.mutate(row.id, { onSuccess: () => setSelected(null) })
  }

  return (
    <>
      <section className="card flush" aria-label={title}>
        <div className="card-head">
          <div className="stack-sm">
            <h2 className="card-title">{title}</h2>
            {description && <p className="card-sub">{description}</p>}
          </div>
          <button type="button" className="btn btn-s" onClick={() => select('new')}>
            <Plus size={16} aria-hidden="true" />
            Add {noun}
          </button>
        </div>
        <QueryState isLoading={list.isLoading} error={list.error}>
          {rows.length === 0 ? (
            <p className="empty">Nothing here yet. Use “Add {noun}” to create one.</p>
          ) : (
            <div className="scroll-x">
              <table className="tbl">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    {columns.map((c) => (
                      <th scope="col" key={c.header} className={c.num ? 'num' : undefined}>
                        {c.header}
                      </th>
                    ))}
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className={[r.id === selected ? 'sel' : '', r.isActive === false ? 'inactive' : ''].join(' ')}
                    >
                      <td>
                        <button
                          type="button"
                          className="row-btn"
                          aria-label={`Edit ${r.name}`}
                          onClick={() => select(r.id)}
                        >
                          {r.name}
                        </button>
                      </td>
                      {columns.map((c) => (
                        <td key={c.header} className={c.num ? 'num' : undefined}>
                          {c.cell(r)}
                        </td>
                      ))}
                      <td>
                        {r.isActive === false ? (
                          <span className="chip chip-locked">Inactive</span>
                        ) : (
                          <span className="chip chip-approved">Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryState>
        {footer && <div className="card-foot small muted">{footer}</div>}
        {!footer && <div style={{ height: 6 }} />}
      </section>

      <Drawer
        open={open}
        onClose={() => select(null)}
        wide={wide}
        title={current ? `Edit: ${current.name}` : `New ${noun}`}
        actions={
          current && (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(current)}
              disabled={remove.isPending}
            >
              <Trash2 size={15} aria-hidden="true" />
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          )
        }
      >
        <ProblemBanner error={remove.error} heading="Could not delete" />
        <Form
          key={selected ?? 'none'}
          initial={current}
          saving={save.isPending}
          error={save.error}
          onCancel={() => select(null)}
          onSubmit={(input) => save.mutate({ id: current?.id, input }, { onSuccess: () => setSelected(null) })}
        />
      </Drawer>
    </>
  )
}

/** Save / Cancel row used at the bottom of every edit form. */
export function FormActions({ saving, onCancel, label = 'Save' }: { saving: boolean; onCancel: () => void; label?: string }) {
  return (
    <div className="form-actions">
      <button type="submit" className="btn btn-p" disabled={saving}>
        {saving ? 'Saving…' : label}
      </button>
      <button type="button" className="btn btn-s" onClick={onCancel}>
        Cancel
      </button>
    </div>
  )
}
