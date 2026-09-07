import React from 'react'

import { brandInitial } from '@/lib/brand'
import { toImage } from '@/lib/properties/mappers'
import { getBusinessDetails, getSiteSettings } from '@/lib/site'

/**
 * Replaces Payload's own logo on the sign-in screen.
 *
 * Reads the logo the client uploaded in Website Settings, so the admin panel
 * carries their brand rather than the CMS vendor's. Falls back to a wordmark
 * until a logo exists, which is the same treatment the public header uses.
 */
export async function BrandLogo() {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])
  const logo = toImage(settings.logo)
  const name = business.companyName || 'Smart Move'

  if (logo) {
    return (
      // Not next/image: this renders inside Payload's own admin bundle, which
      // does not go through the site's image pipeline.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo.url}
        alt={name}
        style={{ maxWidth: '220px', height: 'auto', margin: '0 auto', display: 'block' }}
      />
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.7rem',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.6rem',
          background: '#003d7e',
          color: '#fff',
          fontSize: '1.35rem',
          fontWeight: 700,
        }}
      >
        {brandInitial(name)}
      </span>
      <span style={{ fontSize: '1.6rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{name}</span>
    </div>
  )
}
