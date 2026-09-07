import demoData from './demo-properties.json' with { type: 'json' }
import { heading, paragraph, richText } from '@/lib/lexical'

/**
 * Turns the scraped fixtures in `demo-properties.json` into Payload documents.
 *
 * The JSON records what the source listings actually say. Everything about how
 * those facts are *presented* on a Smart Move lettings site is decided here, so
 * the two concerns stay separate and re-running the scraper never overwrites a
 * judgement call.
 *
 * The photographs and particulars belong to the agency that published them.
 * They are development scaffolding: see the licence note in
 * docs/client-content-required.md.
 */

export interface ScrapedProperty {
  sourceUrl: string
  slug: string
  listing: 'sale' | 'let'
  advertisedPrice: number
  heading: string
  bedrooms: number
  bathrooms?: number
  propertyType: string
  furnishedStatus?: string
  addressLine1?: string
  addressLine2?: string
  townCity?: string
  postcode?: string
  epcRating?: string
  councilTaxBand?: string
  petsConsidered?: boolean
  gardenIncluded?: boolean
  parking?: 'garage' | 'off-street'
  keyFeatures: string[]
  paragraphs: string[]
  images: { file: string; caption: string }[]
}

export const scrapedProperties = demoData as ScrapedProperty[]

interface Presentation {
  /**
   * Monthly rent in pounds. Two of the six source listings are lettings and
   * keep their advertised figure. The other four are sale listings; a
   * lettings-only site needs a rent, so these are illustrative figures in
   * line with what that size and type of property lets for locally. They are
   * not the agency's own numbers.
   */
  monthlyRent: number
  status: 'available' | 'let-agreed' | 'let' | 'draft'
  featured?: boolean
  furnishedStatus?: 'unfurnished' | 'part-furnished' | 'furnished'
  /** Days from the seed run. Blank means available now. */
  availableInDays?: number
  /**
   * Corrections where the source listing contradicts itself. Its room-count
   * icons are not always consistent with its own room-by-room description.
   */
  bedrooms?: number
  bathrooms?: number
}

/** How each type reads inside a property title. */
const TYPE_WORDS: Record<string, string> = {
  detached: 'detached house',
  'semi-detached': 'semi-detached house',
  terraced: 'terraced house',
  flat: 'flat',
  bungalow: 'bungalow',
  room: 'room in a shared house',
  commercial: 'commercial premises',
}

const PRESENTATION: Record<string, Presentation> = {
  'langley-drive-scunthorpe': {
    monthlyRent: 825,
    status: 'available',
    featured: true,
    furnishedStatus: 'unfurnished',
  },
  'st-johns-road-scunthorpe': {
    monthlyRent: 950,
    status: 'available',
    featured: true,
    furnishedStatus: 'unfurnished',
    availableInDays: 30,
  },
  'horbury-close-scunthorpe': {
    monthlyRent: 725,
    status: 'available',
    featured: true,
    furnishedStatus: 'unfurnished',
  },
  'exton-court-scunthorpe': {
    // Advertised at £625 pcm on the source listing.
    monthlyRent: 625,
    status: 'available',
    furnishedStatus: 'unfurnished',
  },
  'marsden-drive-scunthorpe': {
    // Advertised at £595 pcm on the source listing.
    monthlyRent: 595,
    status: 'let-agreed',
    furnishedStatus: 'part-furnished',
  },
  'anne-close-keadby-scunthorpe': {
    monthlyRent: 550,
    status: 'available',
    furnishedStatus: 'unfurnished',
    availableInDays: 14,
    // The source page's icons claim three bedrooms and one bathroom, but its
    // own room list, feature list and photographs all show two of each.
    bedrooms: 2,
    bathrooms: 2,
  },
}

/**
 * The source copy names its own agency and, for the four sale listings, talks
 * about buying. Ordered longest-first so the specific phrases win.
 */
const REWRITES: [RegExp, string][] = [
  [/\*\*NO CHAIN\*\*\s*/gi, ''],
  [/brought to the market for sale by/gi, 'brought to the market to let by'],
  [/brings? to the market for sale/gi, 'brings to the market to let'],
  [/opportunity has arisen to purchase/gi, 'opportunity has arisen to rent'],
  [/first[- ]time buyers?/gi, 'first-time renter'],
  [/property ladder/gi, 'rental ladder'],
  [/Bella Properties/g, 'Smart Move'],
  [/\bfor sale\b/gi, 'to let'],
  [/\bpurchase\b/gi, 'rent'],
  [/\bbuyers?\b/gi, 'tenant'],
  // The source copy uses markdown-style emphasis that nothing renders.
  [/\*{1,2}([^*]+)\*{1,2}/g, '$1'],
]

function rewrite(text: string): string {
  return REWRITES.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    text,
  )
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/**
 * Room headings in the source look like `Living Room (4.45 x 3.56 (14'7" x 11'8"))`.
 * Returns the heading reformatted as `Living Room — 4.45m x 3.56m (14'7" x 11'8")`,
 * or null when the line is ordinary prose.
 */
function roomHeading(line: string): string | null {
  const withDimensions = line.match(
    /^([^()]{2,60}?)\s*\(\s*([\d.]+)\s*x\s*([\d.]+)\s*(?:\((.*)\))?\s*\)$/,
  )
  if (withDimensions) {
    const [, name, width, depth, imperial] = withDimensions
    const metric = `${width}m x ${depth}m`
    return `${name.trim()} — ${metric}${imperial ? ` (${imperial})` : ''}`
  }

  // Headings without dimensions, such as "External" or "Landing".
  if (line.length <= 32 && !/[.!?,]$/.test(line) && !line.includes('(')) return line

  return null
}

function buildDescription(paragraphs: string[]) {
  const blocks: ReturnType<typeof paragraph | typeof heading>[] = []

  for (const raw of paragraphs) {
    const line = rewrite(raw)
    if (!line) continue

    const room = roomHeading(line)
    if (room) {
      blocks.push(heading(room, 'h3'))
      continue
    }

    blocks.push(paragraph(line))
  }

  return richText(...blocks)
}

function buildShortDescription(paragraphs: string[]): string {
  const first = rewrite(paragraphs[0] ?? '')
  if (first.length <= 220) return first

  // Trim at a word boundary so the card copy never ends mid-word.
  const trimmed = first.slice(0, 200)
  return `${trimmed.slice(0, trimmed.lastIndexOf(' '))}…`
}

/** Five weeks' rent, the legal cap for annual rents under £50,000. */
function depositFor(monthlyRent: number): number {
  return Math.round(((monthlyRent * 12) / 52) * 5 * 0.2) * 5
}

function availableFrom(days?: number): string | undefined {
  if (!days) return undefined
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

export interface DemoProperty {
  slug: string
  data: Record<string, unknown>
  /** Files in `demo-assets/<slug>/`, in gallery order. */
  images: { file: string; alt: string }[]
}

export function buildDemoProperties(): DemoProperty[] {
  return scrapedProperties.map((property, index) => {
    const presentation = PRESENTATION[property.slug]
    if (!presentation) {
      throw new Error(
        `No presentation defined for "${property.slug}". Add one to PRESENTATION in src/scripts/demo-properties.ts.`,
      )
    }

    const bedrooms = presentation.bedrooms ?? property.bedrooms
    const bathrooms = presentation.bathrooms ?? property.bathrooms

    const bedroomWord =
      ['studio', 'one', 'two', 'three', 'four', 'five', 'six'][bedrooms] ?? String(bedrooms)
    const typeWord = TYPE_WORDS[property.propertyType] ?? property.propertyType
    const title = `${bedroomWord} bedroom ${typeWord}, ${property.addressLine1 ?? property.heading}`

    return {
      slug: property.slug,
      data: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        slug: property.slug,
        status: presentation.status,
        monthlyRent: presentation.monthlyRent,
        deposit: depositFor(presentation.monthlyRent),
        bedrooms,
        bathrooms,
        propertyType: property.propertyType,
        displayLocation: property.heading,
        furnishedStatus: presentation.furnishedStatus ?? property.furnishedStatus,
        availableFrom: availableFrom(presentation.availableInDays),
        shortDescription: buildShortDescription(property.paragraphs),
        keyFeatures: property.keyFeatures,
        description: buildDescription(property.paragraphs),
        addressLine1: property.addressLine1,
        addressLine2: property.addressLine2,
        townCity: property.townCity,
        county: 'North Lincolnshire',
        postcode: property.postcode,
        epcRating: property.epcRating,
        councilTaxBand: property.councilTaxBand,
        petsConsidered: property.petsConsidered ?? false,
        gardenIncluded: property.gardenIncluded ?? false,
        parking: property.parking ?? 'none',
        featured: presentation.featured ?? false,
        // Staggered so the listing order looks like real stock coming in.
        publishedAt: new Date(Date.now() - index * 3 * 86_400_000).toISOString(),
      },
      images: property.images.map((image, position) => ({
        file: image.file,
        alt: image.caption
          ? `${image.caption} at ${property.heading}`
          : `Photograph ${position + 1} of ${property.heading}`,
      })),
    }
  })
}
