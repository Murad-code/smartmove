'use client'

import Link from 'next/link'
import Script from 'next/script'
import React, { Fragment, useEffect, useLayoutEffect, useRef } from 'react'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { HoneypotField } from '@/components/ui/Field'
import type { FormState } from '@/lib/forms/state'
import { scrollNodeIntoView } from '@/lib/programmatic-scroll'

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
  // Written after mount rather than during render, so the component stays
  // pure and the server and client markup match. A submission that arrives
  // within two seconds of this timestamp was not filled in by a person.
  const renderedAt = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renderedAt.current) renderedAt.current.value = String(Date.now())
  }, [])

  if (state.status === 'success') {
    return (
      <StatusAlert tone="success" title="Message sent" scrollKey="success">
        {state.message}
      </StatusAlert>
    )
  }

  return (
    <form action={action} noValidate className="space-y-5">
      <HoneypotField />
      <input ref={renderedAt} type="hidden" name="renderedAt" defaultValue="" />

      {state.status === 'error' ? (
        <StatusAlert tone="error" title="We could not send your message" scrollKey={state.attempt}>
          {state.message}
        </StatusAlert>
      ) : null}

      <Fragment key={state.status === 'error' ? state.attempt : 'idle'}>{children}</Fragment>

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

/**
 * After submit the visitor is still looking at where the button was. The form
 * then shrinks to this notice, so without an explicit scroll the confirmation
 * sits above the viewport — especially on a phone, under a long listing.
 */
function StatusAlert({
  tone,
  title,
  scrollKey,
  children,
}: {
  tone: 'success' | 'error'
  title: string
  scrollKey: string | number
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    node.focus({ preventScroll: true })
    scrollNodeIntoView(node)
  }, [scrollKey])

  return (
    <div ref={ref} tabIndex={-1} className="outline-none">
      <Alert tone={tone} title={title}>
        {children}
      </Alert>
    </div>
  )
}

/** The consent wording, kept in one place so every form matches. */
export function consentLabel() {
  return (
    <>
      I am happy for Smart Move to use these details to reply to my enquiry. See our{' '}
      <Link href="/privacy-policy" className="font-medium text-navy-700 underline">
        privacy policy
      </Link>
      .
    </>
  )
}
