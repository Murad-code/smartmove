import { PROPERTY_TYPE_LABELS } from './labels'
import type { PropertyFilters, PropertyType } from './types'

/**
 * Filters live in the URL so results are shareable, bookmarkable and rendered
 * on the server. This parses the query string defensively: anything unexpected
 * is dropped rather than passed to the database.
 */

export type SearchParams = Record<string, string | string[] | undefined>

function single(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function positiveInt(value: string | string[] | undefined): number | undefined {
  const raw = single(value)
  if (!raw) return undefined
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function parseFilters(params: SearchParams): PropertyFilters {
  const type = single(params.type)
  const status = single(params.status)
  const sort = single(params.sort)

  return {
    minBedrooms: positiveInt(params.bedrooms),
    maxRent: positiveInt(params.maxRent),
    propertyType:
      type && type in PROPERTY_TYPE_LABELS ? (type as PropertyType) : undefined,
    status: status === 'available' || status === 'let-agreed' ? status : undefined,
    sort:
      sort === 'rent-asc' || sort === 'rent-desc' || sort === 'bedrooms-desc' || sort === 'newest'
        ? sort
        : undefined,
  }
}

export function parsePage(params: SearchParams): number {
  return positiveInt(params.page) ?? 1
}

/** Rebuilds a query string, omitting defaults so tidy URLs stay tidy. */
export function buildQuery(filters: PropertyFilters, page?: number): string {
  const query = new URLSearchParams()
  if (filters.minBedrooms) query.set('bedrooms', String(filters.minBedrooms))
  if (filters.maxRent) query.set('maxRent', String(filters.maxRent))
  if (filters.propertyType) query.set('type', filters.propertyType)
  if (filters.status) query.set('status', filters.status)
  if (filters.sort && filters.sort !== 'newest') query.set('sort', filters.sort)
  if (page && page > 1) query.set('page', String(page))
  const serialised = query.toString()
  return serialised ? `?${serialised}` : ''
}

export function hasActiveFilters(filters: PropertyFilters): boolean {
  return Boolean(
    filters.minBedrooms || filters.maxRent || filters.propertyType || filters.status,
  )
}
