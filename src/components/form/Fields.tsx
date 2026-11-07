import { useId, type ReactNode } from 'react'

interface BaseProps {
  label: string
  hint?: ReactNode
  errors?: string[]
  required?: boolean
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean
  className?: string
}

function FieldShell({
  id,
  label,
  hint,
  errors,
  required,
  hideLabel,
  className,
  children,
}: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={`field ${className ?? ''}`}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'lbl'}>
        {label}
        {required && (
          <span className="req">
            {' '}
            *<span className="sr-only"> required</span>
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {errors && errors.length > 0 && (
        <p id={`${id}-err`} className="err" role="alert">
          {errors.join(' ')}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, hint: unknown, errors?: string[]) {
  const ids = [hint ? `${id}-hint` : '', errors?.length ? `${id}-err` : ''].filter(Boolean)
  return ids.length ? ids.join(' ') : undefined
}

interface TextFieldProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'tel' | 'date' | 'search'
  placeholder?: string
  readOnly?: boolean
  /** Highlight as an "ask" field that still needs a value. */
  ask?: boolean
  inputClassName?: string
}

export function TextField({ value, onChange, type = 'text', placeholder, readOnly, ask, inputClassName, ...base }: TextFieldProps) {
  const id = useId()
  const invalid = Boolean(base.errors?.length)
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        className={`in ${ask && value === '' ? 'ask-empty' : ''} ${inputClassName ?? ''}`}
        type={type}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
        required={base.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(id, base.hint, base.errors)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

interface NumberFieldProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  min?: number | null
  max?: number | null
  step?: number | string | null
  placeholder?: string
  readOnly?: boolean
  ask?: boolean
}

export function NumberField({ value, onChange, min, max, step, placeholder, readOnly, ask, ...base }: NumberFieldProps) {
  const id = useId()
  const invalid = Boolean(base.errors?.length)
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        className={`in num-in ${ask && value === '' ? 'ask-empty' : ''}`}
        type="number"
        inputMode="decimal"
        value={value}
        min={min ?? undefined}
        max={max ?? undefined}
        step={step ?? 'any'}
        placeholder={placeholder}
        readOnly={readOnly}
        required={base.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(id, base.hint, base.errors)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

export interface Option {
  value: string
  label: string
}

interface SelectFieldProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  /** First, empty option, e.g. "Choose a customer". */
  placeholder?: string
  disabled?: boolean
  ask?: boolean
}

export function SelectField({ value, onChange, options, placeholder, disabled, ask, ...base }: SelectFieldProps) {
  const id = useId()
  const invalid = Boolean(base.errors?.length)
  return (
    <FieldShell id={id} {...base}>
      <select
        id={id}
        className={`in ${ask && value === '' ? 'ask-empty' : ''}`}
        value={value}
        disabled={disabled}
        required={base.required}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy(id, base.hint, base.errors)}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

interface TextAreaFieldProps extends BaseProps {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}

export function TextAreaField({ value, onChange, rows = 3, placeholder, ...base }: TextAreaFieldProps) {
  const id = useId()
  return (
    <FieldShell id={id} {...base}>
      <textarea
        id={id}
        className="in"
        rows={rows}
        value={value}
        placeholder={placeholder}
        aria-describedby={describedBy(id, base.hint, base.errors)}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  )
}

interface CheckboxFieldProps {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function CheckboxField({ label, checked, onChange, disabled }: CheckboxFieldProps) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}

/** A read-only value shown in place of an input (locked template fields). */
export function LockedValue({ label, value }: { label: string; value: ReactNode }) {
  const id = useId()
  return (
    <div className="field">
      <span className="lbl" id={id}>
        {label}
      </span>
      <div className="locked-value" aria-labelledby={id} role="group">
        <span>{value}</span>
        <span className="chip chip-locked">Locked</span>
      </div>
    </div>
  )
}
