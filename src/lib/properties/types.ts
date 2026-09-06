/**
 * The property shape the website renders.
 *
 * Front-end components depend on these types, never on Payload's generated
 * `Property` type. Swapping the source of property data for a CRM feed later
 * means writing a new mapper in this folder and nothing else.
 * See docs/property-integration-future.md.
 */

export type PropertyStatus = 'available' | 'let-agreed' | 'let' | 'draft'

export type PropertyType =
  | 'detached'
  | 'semi-detached'
  | 'terraced'
  | 'flat'
  | 'bungalow'
  | 'room'
  | 'commercial'

export type FurnishedStatus = 'unfurnished' | 'part-furnished' | 'furnished'

export interface PropertyImage {
  id: string
  url: string
  alt: string
  width?: number
  height?: number
  /** Payload's generated sizes, used to build a `srcset`-friendly URL. */
  thumbnailUrl?: string
  cardUrl?: string
  wideUrl?: string
  heroUrl?: string
}

export interface PropertySummary {
  id: string
  slug: string
  title: string
  status: PropertyStatus
  monthlyRent: number
  bedrooms: number
  bathrooms?: number
  propertyType: PropertyType
  displayLocation: string
  shortDescription: string
  featured: boolean
  availableFrom?: string
  mainImage?: PropertyImage
}

export interface PropertyDetail extends PropertySummary {
  deposit?: number
  furnishedStatus?: FurnishedStatus
  epcRating?: string
  councilTaxBand?: string
  postcode?: string
  townCity?: string
  petsConsidered: boolean
  gardenIncluded: boolean
  parking?: 'none' | 'on-street' | 'off-street' | 'garage'
  keyFeatures: string[]
  /** Lexical rich text, rendered by `RichText`. */
  description?: unknown
  images: PropertyImage[]
  seo?: {
    title?: string
    description?: string
    image?: PropertyImage
  }
  updatedAt: string
  publishedAt?: string
}

export interface PropertyFilters {
  minBedrooms?: number
  maxRent?: number
  propertyType?: PropertyType
  /** `undefined` means "anything the public may see". */
  status?: 'available' | 'let-agreed'
  sort?: 'newest' | 'rent-asc' | 'rent-desc' | 'bedrooms-desc'
}

export interface PropertyPage {
  properties: PropertySummary[]
  totalDocs: number
  totalPages: number
  page: number
}
