import { cache } from 'react'

import type { BusinessDetail, SiteSetting } from '@/payload-types'

import { getPayloadClient } from './payload'

/**
 * Site-wide CMS content.
 *
 * Wrapped in `cache` so the header, footer and page body share one query per
 * request rather than three.
 */

export const getBusinessDetails = cache(async (): Promise<BusinessDetail> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'business-details', depth: 1 })
})

export const getSiteSettings = cache(async (): Promise<SiteSetting> => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', depth: 1 })
})

export const getHomePage = cache(async () => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'home-page', depth: 1 })
})

/** Where enquiry notifications should go, falling back to the main address. */
export function notificationRecipients(business: BusinessDetail): string[] {
  const address = business.enquiriesEmail || business.email
  return address ? [address] : []
}

export function formatAddress(business: BusinessDetail): string[] {
  const { address } = business
  return [address?.line1, address?.line2, address?.town, address?.county, address?.postcode].filter(
    (line): line is string => Boolean(line && line.trim()),
  )
}

export function mapLink(business: BusinessDetail): string {
  if (business.mapUrl) return business.mapUrl
  const query = encodeURIComponent([business.companyName, ...formatAddress(business)].join(', '))
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

/** `tel:` links must not contain spaces. */
export function telHref(telephone: string): string {
  return `tel:${telephone.replace(/[^\d+]/g, '')}`
}
