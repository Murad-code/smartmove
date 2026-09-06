/**
 * Development tool: builds the demo property fixtures.
 *
 *   pnpm scrape:demo
 *
 * Fetches the source listings, extracts the particulars, downsizes the
 * photographs into `src/scripts/demo-assets/<slug>/`, and writes
 * `src/scripts/demo-properties.json`. The seed reads both, so it needs no
 * network access and produces the same result every time.
 *
 * The output is demo content only. See the licence note in
 * docs/client-content-required.md: these particulars and photographs belong to
 * the agency that published them and must be replaced with Smart Move's own
 * before the site goes live.
 */

import fs from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { slugify } from '../fields/slug'

const SOURCES = [
  'https://www.bella-properties.co.uk/properties-for-sale/property/791-langley-drive-scunthorpe',
  'https://www.bella-properties.co.uk/properties-for-sale/property/790-anne-close-keadby-scunthorpe',
  'https://www.bella-properties.co.uk/properties-for-sale/property/788-horbury-close-scunthorpe',
  'https://www.bella-properties.co.uk/properties-for-sale/property/789-st-johns-road-scunthorpe',
  'https://www.bella-properties.co.uk/properties-to-let/property/787-exton-court-scunthorpe',
  'https://www.bella-properties.co.uk/properties-to-let/property/786-marsden-drive-scunthorpe',
]

const ASSET_DIR = path.resolve(import.meta.dirname, 'demo-assets')
const OUTPUT_FILE = path.resolve(import.meta.dirname, 'demo-properties.json')

/** Enough for a convincing gallery without bloating the repository. */
const MAX_IMAGES = 8
const IMAGE_WIDTH = 1600

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

// ---------------------------------------------------------------------------
// Tiny HTML helpers. A DOM parser would be a dependency for six pages of a
// single, stable template, so these read the specific patterns that template
// emits and throw loudly if it changes.
// ---------------------------------------------------------------------------

function decode(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'")
    .replace(/&pound;/g, '£')
    .replace(/&(?:ldquo|rdquo);/g, '"')
    .replace(/&hellip;/g, '…')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripTags(value: string): string {
  return decode(value.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function firstMatch(html: string, pattern: RegExp): string | undefined {
  const match = html.match(pattern)
  return match?.[1]
}

/** Splits the description block into paragraphs, keeping the room headings. */
function extractParagraphs(html: string): string[] {
  const wrapper = firstMatch(
    html,
    /<div[^>]*class="[^"]*eapow-desc-wrapper[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/,
  )
  if (!wrapper) return []

  return (
    wrapper
      .split(/<\/?(?:p|br\s*\/?|h\d)[^>]*>/i)
      .map(stripTags)
      .filter(Boolean)
      // The agency's own boilerplate disclaimer is not ours to republish.
      .filter((line) => !/^Disclaimer$/i.test(line))
      .filter((line) => !/makes no warranty as to the accuracy/i.test(line))
  )
}

function extractFeatures(html: string): string[] {
  const list = firstMatch(html, /<ul[^>]*id="starItem"[^>]*>([\s\S]*?)<\/ul>/)
  if (!list) return []
  return [...list.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)]
    .map((m) => stripTags(m[1]))
    .filter(Boolean)
}

/** Bed, bath and reception counts, in the order the template renders them. */
function extractCounts(html: string): { bedrooms?: number; bathrooms?: number } {
  const block = firstMatch(
    html,
    /<div[^>]*id="PropertyRoomsIcons"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/,
  )
  if (!block) return {}

  const counts = [...block.matchAll(/flaticon-(bed|bath|sofa)[^>]*><\/i><span[^>]*>(\d+)<\/span>/g)]
  const byIcon = Object.fromEntries(counts.map((m) => [m[1], Number(m[2])]))

  return { bedrooms: byIcon.bed, bathrooms: byIcon.bath }
}

function extractImages(html: string): { url: string; caption: string }[] {
  const anchors = [
    ...html.matchAll(
      /<a[^>]+href="(https:\/\/[^"]+\/main\/\d+\.jpe?g)"[^>]+title="([^"]*)"[^>]+data-lightbox="eapowgalleryslides"/g,
    ),
  ]

  const seen = new Set<string>()
  const images: { url: string; caption: string }[] = []
  for (const [, url, caption] of anchors) {
    if (seen.has(url)) continue
    seen.add(url)
    images.push({ url, caption: tidyCaption(decode(caption)) })
  }
  return images
}

/**
 * Some records use the raw upload filename as the caption. Those make useless
 * alt text, so they are dropped and the seed falls back to a positional
 * description instead.
 */
function tidyCaption(raw: string): string {
  const value = raw.trim()
  if (!value) return ''
  if (/\.(jpe?g|png|webp)$/i.test(value)) return ''
  if (/^[0-9a-f]{6,}[-_]/i.test(value)) return ''
  // "LOUNGE" and "BEDROOM 1" read better in sentence case.
  if (value === value.toUpperCase()) {
    return value.charAt(0) + value.slice(1).toLowerCase()
  }
  return value
}

const POSTCODE = /\b([A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2})\b/i

function extractAddress(html: string, heading: string) {
  const block = firstMatch(html, /<address>([\s\S]*?)<\/address>/)
  const rest = block ? stripTags(block.replace(/<strong>[\s\S]*?<\/strong>/, '')) : ''
  const postcode = rest.match(POSTCODE)?.[1]

  // The <address> element runs the street and locality together
  // ("Anne Close Keadby"), whereas the heading separates them properly
  // ("Anne Close, Keadby, Scunthorpe"), so the heading is the better source.
  const parts = heading
    .split(',')
    .map((part) => part.replace(POSTCODE, '').trim())
    .filter(Boolean)

  return {
    addressLine1: parts[0],
    addressLine2: parts.length > 2 ? parts[1] : undefined,
    townCity: parts.length > 1 ? parts[parts.length - 1] : undefined,
    postcode: postcode?.toUpperCase().replace(/\s+/g, ' '),
  }
}

function extractSidecol(html: string, label: string): string | undefined {
  const value = firstMatch(html, new RegExp(`<b>\\s*${label}\\s*</b>\\s*:?\\s*([^<]*)<`, 'i'))
  return value ? decode(value).trim() : undefined
}

/**
 * EPC and council tax band are only ever in the feature list. Gardens, pets
 * and parking are as likely to be described in the write-up, so both are
 * searched.
 */
function fromFeatures(features: string[], description: string) {
  const joined = `${features.join(' | ')} | ${description}`
  return {
    epcRating: joined.match(/EPC\s*(?:Rated|Rating)?\s*[-:]?\s*([A-G])\b/i)?.[1]?.toUpperCase(),
    councilTaxBand: joined.match(/Council\s*Tax\s*Band\s*[-:]?\s*([A-H])\b/i)?.[1]?.toUpperCase(),
    petsConsidered: /pets?\s+(?:considered|welcome|allowed)/i.test(joined),
    gardenIncluded: /\bgardens?\b/i.test(joined) && !/no garden/i.test(joined),
    parking: /\bgarage\b/i.test(joined)
      ? ('garage' as const)
      : /off[- ]road parking|driveway|off street/i.test(joined)
        ? ('off-street' as const)
        : undefined,
  }
}

function guessPropertyType(text: string) {
  const haystack = text.toLowerCase()
  if (/\bdetached bungalow|\bbungalow\b/.test(haystack)) return 'bungalow'
  if (/\bsemi[- ]detached\b/.test(haystack)) return 'semi-detached'
  if (/\bdetached\b/.test(haystack)) return 'detached'
  if (/\bterrace/.test(haystack)) return 'terraced'
  if (/\bapartment\b|\bflat\b|\bmaisonette\b/.test(haystack)) return 'flat'
  if (/\broom\b|\bhmo\b/.test(haystack)) return 'room'
  return 'terraced'
}

function guessFurnishing(text: string) {
  const haystack = text.toLowerCase()
  if (/part[- ]furnished/.test(haystack)) return 'part-furnished'
  if (/\bunfurnished\b/.test(haystack)) return 'unfurnished'
  if (/\bfurnished\b/.test(haystack)) return 'furnished'
  return undefined
}

// ---------------------------------------------------------------------------

async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`${response.status} for ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

async function scrape(sourceUrl: string) {
  process.stdout.write(`Fetching ${sourceUrl}\n`)

  const response = await fetch(sourceUrl, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`${response.status} for ${sourceUrl}`)
  const html = await response.text()

  const pageTitle = stripTags(firstMatch(html, /<title>([\s\S]*?)<\/title>/) ?? '')
  const heading = stripTags(firstMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) ?? '')
  const priceText = stripTags(
    firstMatch(html, /class="[^"]*eapow-detail-price[^"]*"[^>]*>([\s\S]*?)<\//) ?? '',
  )
  const price = Number(priceText.replace(/[^\d]/g, '')) || undefined

  const features = extractFeatures(html)
  const paragraphs = extractParagraphs(html)
  const counts = extractCounts(html)
  const images = extractImages(html).slice(0, MAX_IMAGES)

  const descriptionText = paragraphs.join(' ')
  const typeSource = `${pageTitle} ${features.join(' ')} ${descriptionText}`

  const saleType = extractSidecol(html, 'Sale Type') ?? ''
  const listing =
    /to let|rent/i.test(saleType) || sourceUrl.includes('properties-to-let')
      ? ('let' as const)
      : ('sale' as const)

  // The template appends the price to the h1, e.g. "Langley Drive, Scunthorpe £185,000".
  const location = (heading || pageTitle)
    .replace(/\s*£[\d,]+(?:\s*(?:PCM|PW|pcm|pw))?\s*$/i, '')
    .trim()

  const address = extractAddress(html, location)
  const slug = slugify(location)

  if (!price || !counts.bedrooms || !images.length) {
    throw new Error(
      `Extraction failed for ${sourceUrl}: price=${price} bedrooms=${counts.bedrooms} images=${images.length}. ` +
        'The source template has probably changed.',
    )
  }

  // --- Photographs --------------------------------------------------------
  const dir = path.join(ASSET_DIR, slug)
  await fs.mkdir(dir, { recursive: true })

  const savedImages: { file: string; caption: string }[] = []
  for (const [index, image] of images.entries()) {
    const file = `${String(index + 1).padStart(2, '0')}.jpg`
    const buffer = await download(image.url)
    // Downsized and recompressed so the fixtures stay a sensible size in git.
    await sharp(buffer)
      .resize({ width: IMAGE_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(dir, file))
    savedImages.push({ file, caption: image.caption })
  }

  return {
    sourceUrl,
    slug,
    listing,
    /** The advertised figure: monthly rent for lettings, asking price for sales. */
    advertisedPrice: price,
    heading: location,
    bedrooms: counts.bedrooms,
    bathrooms: counts.bathrooms,
    propertyType: guessPropertyType(typeSource),
    furnishedStatus: guessFurnishing(typeSource),
    ...address,
    ...fromFeatures(features, descriptionText),
    keyFeatures: features,
    paragraphs,
    images: savedImages,
  }
}

async function main() {
  await fs.rm(ASSET_DIR, { recursive: true, force: true })
  await fs.mkdir(ASSET_DIR, { recursive: true })

  const properties = []
  for (const url of SOURCES) {
    properties.push(await scrape(url))
  }

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(properties, null, 2)}\n`)
  process.stdout.write(`\nWrote ${properties.length} properties to ${OUTPUT_FILE}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
