import type { PropertyFilters, PropertyStatus, PropertyType } from './types'

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  detached: 'Detached house',
  'semi-detached': 'Semi-detached house',
  terraced: 'Terraced house',
  flat: 'Flat',
  bungalow: 'Bungalow',
  room: 'Room in a shared house',
  commercial: 'Commercial premises',
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Available',
  'let-agreed': 'Let agreed',
  let: 'Let',
  draft: 'Not published',
}

export const FURNISHED_LABELS: Record<string, string> = {
  unfurnished: 'Unfurnished',
  'part-furnished': 'Part furnished',
  furnished: 'Furnished',
}

export const PARKING_LABELS: Record<string, string> = {
  none: 'No parking',
  'on-street': 'On-street parking',
  'off-street': 'Off-street parking',
  garage: 'Garage',
}

/** Reads the active filters back as a sentence, used in the empty state. */
export function describeFilters(filters: PropertyFilters): string {
  const parts: string[] = []
  if (filters.propertyType) parts.push(PROPERTY_TYPE_LABELS[filters.propertyType].toLowerCase())
  if (filters.minBedrooms)
    parts.push(`${filters.minBedrooms} or more bedroom${filters.minBedrooms === 1 ? '' : 's'}`)
  if (filters.maxRent) parts.push(`up to £${filters.maxRent.toLocaleString('en-GB')} a month`)
  if (!parts.length) return ''
  return parts.join(', ')
}
