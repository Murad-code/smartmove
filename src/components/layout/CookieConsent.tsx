'use client'

import Link from 'next/link'
import React from 'react'

import { setConsent, useConsent } from '@/lib/consent'

/**
 * Only rendered when analytics are actually configured: with no non-essential
 * storage there is nothing to consent to, and a banner would just be noise.
 */
export function CookieConsent({ policyHref = '/cookie-policy' }: { policyHref?: string }) {
  const consent = useConsent()

  // `undefined` on the server and the first client render, so the banner never
  // flashes in before we know whether a choice has already been made.
  if (consent !== null) return null

  return (
    <div
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-3 bottom-3 z-50 rounded-xl border border-ink-200 bg-white p-4 shadow-raised sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:p-5"
    >
      <p className="text-sm text-ink-700">
        We would like to use anonymous analytics to see which pages are useful. Nothing is used
        to identify you.{' '}
        <Link href={policyHref} className="font-medium text-navy-700 underline">
          How we use cookies
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => setConsent('rejected')}
          className="rounded-lg border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Reject non-essential
        </button>
      </div>
    </div>
  )
}
