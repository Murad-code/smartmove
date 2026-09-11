'use client'

import React, { useActionState } from 'react'

import { CheckboxField, SelectField, TextAreaField, TextField } from '@/components/ui/Field'
import { submitRequirements } from '@/lib/forms/actions'
import { IDLE_STATE, formValues } from '@/lib/forms/state'
import { PROPERTY_TYPE_LABELS } from '@/lib/properties/labels'

import { FormShell, consentLabel } from './FormShell'

const TYPE_OPTIONS = Object.values(PROPERTY_TYPE_LABELS).map((label) => ({
  label,
  value: label,
}))

/**
 * Captures what an applicant is looking for when nothing currently matches.
 * Matching properties to these records is a manual job for staff for now; see
 * docs/property-integration-future.md.
 */
export function RequirementsForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState(submitRequirements, IDLE_STATE)
  const errors = state.status === 'error' ? (state.errors ?? {}) : {}
  const values = formValues(state)

  return (
    <FormShell
      action={action}
      state={state}
      pending={pending}
      submitLabel="Register my requirements"
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
          autoComplete="tel"
          error={errors.telephone}
          defaultValue={values.telephone}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Preferred area"
          name="preferredArea"
          placeholder="Ashby, Brumby, anywhere in Scunthorpe"
          error={errors.preferredArea}
          defaultValue={values.preferredArea}
        />
        <SelectField
          label="Type of property"
          name="propertyType"
          options={TYPE_OPTIONS}
          placeholder="Any type"
          error={errors.propertyType}
          defaultValue={values.propertyType}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Minimum bedrooms"
          name="minBedrooms"
          type="number"
          min={0}
          error={errors.minBedrooms}
          defaultValue={values.minBedrooms}
        />
        <TextField
          label="Maximum monthly rent"
          name="maxRent"
          type="number"
          min={0}
          hint="In pounds per month."
          error={errors.maxRent}
          defaultValue={values.maxRent}
        />
      </div>
      <TextField
        label="When are you looking to move?"
        name="moveDate"
        placeholder="Within the next two months"
        error={errors.moveDate}
        defaultValue={values.moveDate}
      />
      <TextAreaField
        label="Anything else we should know?"
        name="message"
        rows={3}
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
