import type { FieldErrors } from './schemas'

/**
 * The shape every enquiry action returns, consumed by `useActionState`.
 * `idle` exists so a freshly rendered form renders no messages at all.
 *
 * Failed submissions carry the typed values back so React's post-action form
 * reset can restore them. `attempt` changes on every failure so the fields
 * remount with those values; without that, `defaultValue` is ignored.
 */
export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | {
      status: 'error'
      message: string
      errors?: FieldErrors
      values: Record<string, string>
      attempt: number
    }

export const IDLE_STATE: FormState = { status: 'idle' }

/** Shown whenever a submission is refused without saying which check failed. */
export const GENERIC_ERROR =
  'Sorry, we could not send your message. Please try again, or call us instead.'

/**
 * Honeypot, timing stamp and Turnstile token are not fields the visitor filled
 * in, so they are not restored after a failed submit.
 */
const TRANSIENT_FIELDS = new Set(['companyWebsite', 'renderedAt', 'cf-turnstile-response'])

export function submittedFieldValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [name, value] of formData.entries()) {
    if (typeof value !== 'string' || TRANSIENT_FIELDS.has(name)) continue
    values[name] = value
  }
  return values
}

export function errorState(
  previous: FormState,
  formData: FormData,
  message: string,
  errors?: FieldErrors,
): FormState {
  return {
    status: 'error',
    message,
    errors,
    values: submittedFieldValues(formData),
    attempt: previous.status === 'error' ? previous.attempt + 1 : 1,
  }
}

export function formValues(state: FormState): Record<string, string> {
  return state.status === 'error' ? state.values : {}
}
