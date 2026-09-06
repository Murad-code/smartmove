'use client'

import React, { useActionState } from 'react'

import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { submitGeneralEnquiry } from '@/lib/forms/actions'
import { IDLE_STATE } from '@/lib/forms/state'

import { FormShell, consentLabel } from './FormShell'

const TOPICS = [
  { label: 'Renting a property', value: 'Renting a property' },
  { label: 'Letting out my property', value: 'Letting out my property' },
  { label: 'Property management', value: 'Property management' },
  { label: 'An existing tenancy', value: 'An existing tenancy' },
  { label: 'Something else', value: 'Something else' },
]

export function GeneralEnquiryForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState(submitGeneralEnquiry, IDLE_STATE)
  const errors = state.status === 'error' ? (state.errors ?? {}) : {}

  return (
    <FormShell
      action={action}
      state={state}
      pending={pending}
      submitLabel="Send enquiry"
      turnstileSiteKey={turnstileSiteKey}
    >
      <TextField label="Your name" name="name" required autoComplete="name" error={errors.name} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          error={errors.email}
        />
        <TextField
          label="Telephone"
          name="telephone"
          type="tel"
          autoComplete="tel"
          error={errors.telephone}
        />
      </div>
      <SelectField
        label="What is your enquiry about?"
        name="enquiryTopic"
        options={TOPICS}
        placeholder="Please choose"
        error={errors.enquiryTopic}
      />
      <TextAreaField label="Your message" name="message" required error={errors.message} />
      <CheckboxField name="consent" error={errors.consent}>
        {consentLabel()}
      </CheckboxField>
    </FormShell>
  )
}
