import { cache } from 'react'
import type { Where } from 'payload'

import { PUBLIC_PROPERTY_STATUSES } from '@/collections/Properties'
import { getPayloadClient } from '@/lib/payload'

import { toPropertyDetail, toPropertySummary } from './mappers'
import type {
  PropertyDetail,
  PropertyFilters,
  PropertyPage,
  PropertySummary,
} from './types'

export * from './types'
export { PROPERTY_TYPE_LABELS, describeFilters } from './labels'

export const PROPERTIES_PER_PAGE = 12

const SORT_CLAUSES: Record<NonNullable<PropertyFilters['sort']>, string> = {
  newest: '-publishedAt',
  'rent-asc': 'monthlyRent',
  'rent-desc': '-monthlyRent',
  'bedrooms-desc': '-bedrooms',
}

/** Only ever returns properties a visitor is allowed to see. */
function buildWhere(filters: PropertyFilters): Where {
  const and: Where[] = [
    { status: { in: filters.status ? [filters.status] : PUBLIC_PROPERTY_STATUSES } },
  ]

  if (filters.minBedrooms) and.push({ bedrooms: { greater_than_equal: filters.minBedrooms } })
  if (filters.maxRent) and.push({ monthlyRent: { less_than_equal: filters.maxRent } })
  if (filters.propertyType) and.push({ propertyType: { equals: filters.propertyType } })

  return { and }
}

export const findProperties = cache(
  async (
    filters: PropertyFilters = {},
    page = 1,
    limit = PROPERTIES_PER_PAGE,
  ): Promise<PropertyPage> => {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'properties',
      where: buildWhere(filters),
      sort: SORT_CLAUSES[filters.sort ?? 'newest'],
      // Depth 1 populates the image documents but not their own relationships.
      depth: 1,
      limit,
      page,
      overrideAccess: false,
    })

    return {
      properties: result.docs.map(toPropertySummary),
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page ?? 1,
    }
  },
)

/**
 * Home page selection: properties the owner ticked come first, then the newest.
 * Two queries rather than one so a short featured list is topped up instead of
 * leaving gaps in the grid.
 */
export const findFeaturedProperties = cache(
  async (limit = 3): Promise<PropertySummary[]> => {
    const payload = await getPayloadClient()

    const featured = await payload.find({
      collection: 'properties',
      where: {
        and: [{ featured: { equals: true } }, { status: { in: PUBLIC_PROPERTY_STATUSES } }],
      },
      sort: '-publishedAt',
      depth: 1,
      limit,
      overrideAccess: false,
    })

    const selected = featured.docs.map(toPropertySummary)
    if (selected.length >= limit) return selected

    const topUp = await payload.find({
      collection: 'properties',
      where: {
        and: [
          { status: { in: PUBLIC_PROPERTY_STATUSES } },
          ...(selected.length ? [{ id: { not_in: selected.map((p) => p.id) } }] : []),
        ],
      },
      sort: '-publishedAt',
      depth: 1,
      limit: limit - selected.length,
      overrideAccess: false,
    })

    return [...selected, ...topUp.docs.map(toPropertySummary)]
  },
)

export const findPropertyBySlug = cache(
  async (slug: string): Promise<PropertyDetail | null> => {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'properties',
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
      overrideAccess: false,
    })

    const doc = result.docs[0]
    return doc ? toPropertyDetail(doc) : null
  },
)

/** Other available properties to show at the foot of a property page. */
export const findRelatedProperties = cache(
  async (excludeId: string, limit = 3): Promise<PropertySummary[]> => {
    const payload = await getPayloadClient()

    const result = await payload.find({
      collection: 'properties',
      where: {
        and: [{ status: { in: PUBLIC_PROPERTY_STATUSES } }, { id: { not_equals: excludeId } }],
      },
      sort: '-publishedAt',
      depth: 1,
      limit,
      overrideAccess: false,
    })

    return result.docs.map(toPropertySummary)
  },
)

/** Slugs for the sitemap and for static params. */
export async function findAllPropertySlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  const payload = await getPayloadClient()

  const result = await payload.find({
    collection: 'properties',
    where: { status: { in: PUBLIC_PROPERTY_STATUSES } },
    depth: 0,
    limit: 1000,
    select: { slug: true, updatedAt: true },
    overrideAccess: false,
  })

  return result.docs
    .filter((doc): doc is typeof doc & { slug: string } => Boolean(doc.slug))
    .map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
}
