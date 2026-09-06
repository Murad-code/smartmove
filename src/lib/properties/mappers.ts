import type { Media, Property } from '@/payload-types'

import type {
  PropertyDetail,
  PropertyImage,
  PropertyStatus,
  PropertySummary,
  PropertyType,
} from './types'

/**
 * Payload builds media URLs against `serverURL`, which makes them absolute.
 * `next/image` would then treat our own files as a remote host, so anything
 * on our own origin is turned back into a path.
 */
function toRelativeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('/')) return url
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url
  }
}

/** Payload returns either an ID or a populated document depending on depth. */
function isPopulated<T extends { id: unknown }>(value: unknown): value is T {
  return typeof value === 'object' && value !== null && 'id' in value
}

export function toImage(value: unknown): PropertyImage | undefined {
  if (!isPopulated<Media>(value) || !value.url) return undefined

  const url = toRelativeUrl(value.url)
  if (!url) return undefined

  return {
    id: String(value.id),
    url,
    alt: value.alt || '',
    width: value.width ?? undefined,
    height: value.height ?? undefined,
    thumbnailUrl: toRelativeUrl(value.sizes?.thumbnail?.url),
    cardUrl: toRelativeUrl(value.sizes?.card?.url),
    wideUrl: toRelativeUrl(value.sizes?.wide?.url),
    heroUrl: toRelativeUrl(value.sizes?.hero?.url),
  }
}

function toImages(value: Property['images']): PropertyImage[] {
  if (!Array.isArray(value)) return []
  return value.map(toImage).filter((image): image is PropertyImage => Boolean(image))
}

export function toPropertySummary(doc: Property): PropertySummary {
  const images = toImages(doc.images)

  return {
    id: String(doc.id),
    slug: doc.slug ?? String(doc.id),
    title: doc.title,
    status: doc.status as PropertyStatus,
    monthlyRent: doc.monthlyRent,
    bedrooms: doc.bedrooms,
    bathrooms: doc.bathrooms ?? undefined,
    propertyType: doc.propertyType as PropertyType,
    displayLocation: doc.displayLocation,
    shortDescription: doc.shortDescription,
    featured: Boolean(doc.featured),
    availableFrom: doc.availableFrom ?? undefined,
    // The first photo is the main photo; the CMS says so on the Photos tab.
    mainImage: images[0],
  }
}

export function toPropertyDetail(doc: Property): PropertyDetail {
  return {
    ...toPropertySummary(doc),
    deposit: doc.deposit ?? undefined,
    furnishedStatus: (doc.furnishedStatus as PropertyDetail['furnishedStatus']) ?? undefined,
    epcRating: doc.epcRating ?? undefined,
    councilTaxBand: doc.councilTaxBand ?? undefined,
    postcode: doc.postcode ?? undefined,
    townCity: doc.townCity ?? undefined,
    petsConsidered: Boolean(doc.petsConsidered),
    gardenIncluded: Boolean(doc.gardenIncluded),
    parking: (doc.parking as PropertyDetail['parking']) ?? undefined,
    keyFeatures: (doc.keyFeatures ?? [])
      .map((row) => row.feature)
      .filter((feature): feature is string => Boolean(feature)),
    description: doc.description ?? undefined,
    images: toImages(doc.images),
    seo: doc.meta
      ? {
          title: doc.meta.title ?? undefined,
          description: doc.meta.description ?? undefined,
          image: toImage(doc.meta.image),
        }
      : undefined,
    updatedAt: doc.updatedAt,
    publishedAt: doc.publishedAt ?? undefined,
  }
}
