import React from 'react'

import { getBusinessDetails } from '@/lib/site'

/**
 * Compact mark in the admin header. The image itself comes from `/brand-icon`,
 * which reads the favicon uploaded in Website Settings.
 *
 * Sized to the slot Payload gives it (18px, 16px below 1024px). A larger
 * explicit size is clipped by the header's overflow.
 */
export async function BrandIcon() {
  const business = await getBusinessDetails()
  const name = business.companyName || 'Smart Move'

  return (
    // Not next/image: this renders inside Payload's admin bundle.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand-icon"
      alt={name}
      width={18}
      height={18}
      style={{ display: 'block', width: '100%', height: 'auto' }}
    />
  )
}
