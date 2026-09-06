'use client'

import Script from 'next/script'
import React, { useEffect, useState } from 'react'

import { CONSENT_EVENT, type ConsentValue, readConsent } from './CookieConsent'

/**
 * Loads an analytics script only after the visitor has accepted.
 *
 * Both providers are configured entirely by environment variables, so no
 * tracking id is ever committed and turning analytics off means clearing one
 * variable.
 */
export function Analytics({
  provider,
  id,
  plausibleHost,
}: {
  provider: string
  id: string
  plausibleHost: string
}) {
  const [consent, setConsent] = useState<ConsentValue | null>(null)

  useEffect(() => {
    setConsent(readConsent())
    function onConsent(event: Event) {
      setConsent((event as CustomEvent<ConsentValue>).detail)
    }
    window.addEventListener(CONSENT_EVENT, onConsent)
    return () => window.removeEventListener(CONSENT_EVENT, onConsent)
  }, [])

  if (consent !== 'accepted' || !id) return null

  if (provider === 'plausible') {
    return (
      <Script
        defer
        data-domain={id}
        src={`${plausibleHost.replace(/\/+$/, '')}/js/script.js`}
        strategy="afterInteractive"
      />
    )
  }

  if (provider === 'ga4') {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}
        </Script>
      </>
    )
  }

  return null
}
