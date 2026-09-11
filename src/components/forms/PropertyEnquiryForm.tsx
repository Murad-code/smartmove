'use client'

import React, { useActionState } from 'react'

import { CheckboxField, TextAreaField, TextField } from '@/components/ui/Field'
import { submitPropertyEnquiry } from '@/lib/forms/actions'
import { IDLE_STATE, formValues } from '@/lib/forms/state'

import { FormShell, consentLabel } from './FormShell'

/**
 * The property is carried in hidden fields so the enquiry is always tied to
 * the listing the visitor was looking at, and the notification email names it
 * without a database lookup.
 */
export function PropertyEnquiryForm({
  propertyId,
  propertyTitle,
  turnstileSiteKey,
}: {
  propertyId: string
  propertyTitle: string
  turnstileSiteKey?: string
}) {
  const [state, action, pending] = useActionState(submitPropertyEnquiry, IDLE_STATE)
  const errors = state.status === 'error' ? (state.errors ?? {}) : {}
  const values = formValues(state)
  const viewingMessage = `I would like to arrange a viewing of ${propertyTitle}.`

  return (
    <FormShell
      action={action}
      state={state}
      pending={pending}
      submitLabel="Send enquiry"
      turnstileSiteKey={turnstileSiteKey}
    >
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="propertyTitle" value={propertyTitle} />

      <TextField
        label="Your name"
        name="name"
        required
        autoComplete="name"
        error={errors.name}
        defaultValue={values.name}
      />
      <TextField
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        error={errors.email}
        defaultValue={values.email}
      />
      <TextField
        label="Telephone"
        name="telephone"
        type="tel"
        required
        autoComplete="tel"
        hint="So we can call you back to arrange a viewing."
        error={errors.telephone}
        defaultValue={values.telephone}
      />
      <TextField
        label="When could you view?"
        name="preferredViewing"
        placeholder="Weekday afternoons, for example"
        error={errors.preferredViewing}
        defaultValue={values.preferredViewing}
      />
      <TextAreaField
        label="Your message"
        name="message"
        rows={4}
        required
        defaultValue={values.message ?? viewingMessage}
        error={errors.message}
      />
      <CheckboxField
        name="consent"
        error={errors.consent}
        defaultChecked={values.consent === 'yes'}
      >
        {consentLabel()}
      </CheckboxField>
    </FormShell>
  )
}
