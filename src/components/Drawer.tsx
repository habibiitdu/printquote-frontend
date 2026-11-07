import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: ReactNode
  /** Buttons shown in the header next to the close button (e.g. Delete). */
  actions?: ReactNode
  /** Wider panel for big editors such as product templates. */
  wide?: boolean
  children: ReactNode
}

/**
 * A panel that slides in from the right over a dimmed page. Built on the native
 * <dialog>, so focus stays inside, Esc closes it and the page behind is inert.
 */
export function Drawer({ open, onClose, title, actions, wide, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Stop the page behind from scrolling while the drawer is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`drawer ${wide ? 'drawer-wide' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc: let React state close it so the two never disagree.
        e.preventDefault()
        onClose()
      }}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {open && (
        <div className="drawer-inner">
          <header className="drawer-head">
            <h2 id={titleId} className="card-title">
              {title}
            </h2>
            <div className="actions">
              {actions}
              <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
          </header>
          <div className="drawer-body">{children}</div>
        </div>
      )}
    </dialog>
  )
}
