import type { FieldErrors } from './schemas'

/**
 * The shape every enquiry action returns, consumed by `useActionState`.
 * `idle` exists so a freshly rendered form renders no messages at all.
 */
export type FormState =
  | { status: 'idle' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string; errors?: FieldErrors }

export const IDLE_STATE: FormState = { status: 'idle' }

/** Shown whenever a submission is refused without saying which check failed. */
export const GENERIC_ERROR =
  'Sorry, we could not send your message. Please try again, or call us instead.'
