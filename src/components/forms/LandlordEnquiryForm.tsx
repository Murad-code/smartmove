'use client'

import React, { useActionState } from 'react'

import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { submitLandlordEnquiry } from '@/lib/forms/actions'
import { IDLE_STATE, formValues } from '@/lib/forms/state'

import { FormShell, consentLabel } from './FormShell'

const SERVICES = [
  { label: 'A free rental valuation', value: 'A free rental valuation' },
  { label: 'Full property management', value: 'Full property management' },
  { label: 'Tenant finding only', value: 'Tenant finding only' },
  { label: 'Rent collection', value: 'Rent collection' },
  { label: 'I am not sure yet', value: 'Not sure yet' },
]

export function LandlordEnquiryForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState(submitLandlordEnquiry, IDLE_STATE)
  const errors = state.status === 'error' ? (state.errors ?? {}) : {}
  const values = formValues(state)

  return (
    <FormShell
      action={action}
      state={state}
      pending={pending}
      submitLabel="Request a callback"
      turnstileSiteKey={turnstileSiteKey}
    >
      <TextField
        label="Your name"
        name="name"
        required
        autoComplete="name"
        error={errors.name}
        defaultValue={values.name}
      />
      <div className="grid gap-5 sm:grid-cols-2">
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
          error={errors.telephone}
          defaultValue={values.telephone}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Postcode of your property"
          name="postcode"
          autoComplete="postal-code"
          placeholder="DN15"
          error={errors.postcode}
          defaultValue={values.postcode}
        />
        <SelectField
          label="What are you interested in?"
          name="serviceInterest"
          options={SERVICES}
          placeholder="Please choose"
          error={errors.serviceInterest}
          defaultValue={values.serviceInterest}
        />
      </div>
      <TextAreaField
        label="Tell us about the property"
        name="message"
        rows={4}
        required
        hint="Number of bedrooms, current condition, and when it will be available."
        error={errors.message}
        defaultValue={values.message}
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
