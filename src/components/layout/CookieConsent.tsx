'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

export const CONSENT_STORAGE_KEY = 'smartmove-cookie-consent'
export const CONSENT_EVENT = 'smartmove:consent'

export type ConsentValue = 'accepted' | 'rejected'

export function readConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  return stored === 'accepted' || stored === 'rejected' ? stored : null
}

/**
 * Cookie consent.
 *
 * Only rendered when analytics are actually configured, because with no
 * non-essential cookies there is nothing to consent to and a banner would just
 * be noise. Choices are kept in `localStorage`, not a cookie, so declining
 * really does leave the visitor with no tracking storage.
 */
export function CookieConsent({ privacyHref = '/cookie-policy' }: { privacyHref?: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) setVisible(true)
  }, [])

  function choose(value: ConsentValue) {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value)
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie choices"
      className="fixed inset-x-3 bottom-3 z-50 rounded-xl border border-ink-200 bg-white p-4 shadow-raised sm:inset-x-auto sm:right-4 sm:bottom-4 sm:max-w-md sm:p-5"
    >
      <p className="text-sm text-ink-700">
        We would like to use anonymous analytics to see which pages are useful. Nothing is
        used to identify you.{' '}
        <Link href={privacyHref} className="font-medium text-navy-700 underline">
          How we use cookies
        </Link>
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => choose('accepted')}
          className="rounded-lg bg-navy-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => choose('rejected')}
          className="rounded-lg border border-ink-300 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Reject non-essential
        </button>
      </div>
    </div>
  )
}
