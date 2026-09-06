'use client'

import Script from 'next/script'
import React, { useMemo } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/ui/Field'
import type { FormState } from '@/lib/forms/state'

/**
 * Shared chrome for every enquiry form: the anti-spam fields, the status
 * messages and the submit button. Individual forms only describe their own
 * inputs.
 */
export function FormShell({
  action,
  state,
  pending,
  submitLabel,
  children,
  turnstileSiteKey,
}: {
  action: (formData: FormData) => void
  state: FormState
  pending: boolean
  submitLabel: string
  children: React.ReactNode
  turnstileSiteKey?: string
}) {
  // Captured once on mount. A submission that arrives within two seconds of
  // this timestamp was not filled in by a person.
  const renderedAt = useMemo(() => String(Date.now()), [])

  if (state.status === 'success') {
    return (
      <Alert tone="success" title="Message sent">
        {state.message}
      </Alert>
    )
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <HoneypotField />
      <input type="hidden" name="renderedAt" value={renderedAt} />

      {state.status === 'error' ? (
        <Alert tone="error" title="We could not send your message">
          {state.message}
        </Alert>
      ) : null}

      {children}

      {turnstileSiteKey ? (
        <>
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-theme="light" />
          <Script
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
            strategy="lazyOnload"
          />
        </>
      ) : null}

      <Button type="submit" size="large" disabled={pending} fullWidth>
        {pending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}

/** The consent wording, kept in one place so every form matches. */
export function consentLabel() {
  return (
    <>
      I am happy for Smart Move to use these details to reply to my enquiry. See our{' '}
      <a href="/privacy-policy" className="font-medium text-navy-700 underline">
        privacy policy
      </a>
      .
    </>
  )
}
