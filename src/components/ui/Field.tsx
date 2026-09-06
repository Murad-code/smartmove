import React, { useId } from 'react'

import { cn } from '@/lib/cn'

const CONTROL =
  'w-full rounded-lg border bg-white px-3.5 py-2.5 text-[0.95rem] text-ink-900 placeholder:text-ink-500 transition-colors focus:border-navy-500 disabled:bg-ink-50'

const CONTROL_TONE = {
  normal: 'border-ink-300 hover:border-ink-400',
  invalid: 'border-red-500 hover:border-red-600',
}

interface FieldProps {
  label: string
  name: string
  hint?: string
  error?: string
  required?: boolean
  children: (props: {
    id: string
    name: string
    'aria-describedby'?: string
    'aria-invalid'?: true
    required?: boolean
    className: string
  }) => React.ReactNode
}

/**
 * One wrapper for every form control so labelling, hints and error wiring are
 * identical everywhere. The render-prop shape means the control gets the same
 * generated ids without callers having to plumb them.
 */
export function Field({ label, name, hint, error, required, children }: FieldProps) {
  const reactId = useId()
  const id = `${name}-${reactId}`
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-ink-500">(optional)</span>
        )}
      </label>
      {hint ? (
        <p id={hintId} className="mb-1.5 text-sm text-ink-500">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        name,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        required,
        className: cn(CONTROL, error ? CONTROL_TONE.invalid : CONTROL_TONE.normal),
      })}
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function TextField(props: Omit<FieldProps, 'children'> & {
  type?: 'text' | 'email' | 'tel' | 'number' | 'date'
  placeholder?: string
  autoComplete?: string
  defaultValue?: string | number
  min?: number
}) {
  const { type = 'text', placeholder, autoComplete, defaultValue, min, ...field } = props
  return (
    <Field {...field}>
      {(control) => (
        <input
          {...control}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          min={min}
        />
      )}
    </Field>
  )
}

export function TextAreaField(props: Omit<FieldProps, 'children'> & {
  rows?: number
  placeholder?: string
  defaultValue?: string
}) {
  const { rows = 5, placeholder, defaultValue, ...field } = props
  return (
    <Field {...field}>
      {(control) => (
        <textarea {...control} rows={rows} placeholder={placeholder} defaultValue={defaultValue} />
      )}
    </Field>
  )
}

export function SelectField(props: Omit<FieldProps, 'children'> & {
  options: { label: string; value: string }[]
  placeholder?: string
  defaultValue?: string
}) {
  const { options, placeholder, defaultValue, ...field } = props
  return (
    <Field {...field}>
      {(control) => (
        <select {...control} defaultValue={defaultValue ?? ''} className={cn(control.className, 'pr-9')}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  )
}

export function CheckboxField({
  name,
  error,
  children,
}: {
  name: string
  error?: string
  children: React.ReactNode
}) {
  const reactId = useId()
  const id = `${name}-${reactId}`
  const errorId = error ? `${id}-error` : undefined

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          value="yes"
          aria-describedby={errorId}
          aria-invalid={error ? true : undefined}
          className={cn(
            'mt-1 size-5 shrink-0 rounded border-2 accent-navy-700',
            error ? 'border-red-500' : 'border-ink-400',
          )}
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-ink-600">
          {children}
        </label>
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Bot trap. Visually hidden rather than `display: none`, because some bots
 * skip fields that are obviously hidden. Real people never focus it because
 * of `tabIndex={-1}`.
 */
export function HoneypotField() {
  return (
    <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
      <label htmlFor="company-website">Leave this field blank</label>
      <input id="company-website" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  )
}
