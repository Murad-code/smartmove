import 'dotenv/config'

import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import { slugify } from '@/fields/slug'

import {
  businessDetails,
  demoProperties,
  homePage,
  pages,
  services,
  siteSettings,
} from './seed-content'

/**
 * Seed script.
 *
 * Idempotent: running it twice updates rather than duplicates, so it is safe
 * to re-run after changing the content in `seed-content.ts`.
 *
 *   pnpm seed
 *
 * The admin user, business details, services and pages are always written,
 * which is exactly what a first deployment needs. The eight demo properties
 * are development scaffolding and are only written when
 * SEED_DEMO_PROPERTIES=true, so a real site never starts with fake stock.
 */

const DEMO_PREFIX = '[DEMO]'

async function makePlaceholderImage(label: string, hue: number): Promise<Buffer> {
  // Generated rather than shipped: no third-party photographs are copied into
  // this repository, and the result is obviously not a real property.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="hsl(${hue}, 24%, 74%)"/>
        <stop offset="100%" stop-color="hsl(${hue + 20}, 28%, 52%)"/>
      </linearGradient>
    </defs>
    <rect width="1600" height="1200" fill="url(#g)"/>
    <rect x="560" y="470" width="480" height="260" rx="16" fill="rgba(255,255,255,0.16)"/>
    <text x="800" y="600" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
      font-size="64" font-weight="700" fill="#ffffff">DEMO PHOTO</text>
    <text x="800" y="660" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
      font-size="34" fill="rgba(255,255,255,0.9)">${label}</text>
  </svg>`

  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toBuffer()
}

async function main() {
  const seedDemoProperties = process.env.SEED_DEMO_PROPERTIES === 'true'
  const payload = await getPayload({ config })

  // --- Admin user ----------------------------------------------------------
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@smartmove4u.co.uk'
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!password) {
    throw new Error('Set SEED_ADMIN_PASSWORD in .env before running the seed.')
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Smart Move', role: 'admin' },
      overrideAccess: true,
    })
    payload.logger.info(`Created admin user ${email}`)
  } else {
    payload.logger.info(`Admin user ${email} already exists`)
  }

  // --- Globals -------------------------------------------------------------
  await payload.updateGlobal({
    slug: 'business-details',
    data: businessDetails,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: siteSettings,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'home-page',
    // The generated global type is stricter than the plain seed literals, and
    // asserting once here is clearer than annotating every nested group.
    data: homePage as never,
    overrideAccess: true,
  })
  payload.logger.info('Updated Business Details, Website Settings and Home Page')

  // --- Services ------------------------------------------------------------
  for (const service of services) {
    const existing = await payload.find({
      collection: 'services',
      where: { slug: { equals: service.slug } },
      limit: 1,
      overrideAccess: true,
    })

    const data = { ...service, _status: 'published' } as never

    if (existing.docs[0]) {
      await payload.update({
        collection: 'services',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'services', data, overrideAccess: true })
    }
  }
  payload.logger.info(`Seeded ${services.length} services`)

  // --- Pages ---------------------------------------------------------------
  for (const page of pages) {
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: page.slug } },
      limit: 1,
      overrideAccess: true,
    })

    const data = { ...page, _status: 'published' } as never

    if (existing.docs[0]) {
      await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'pages', data, overrideAccess: true })
    }
  }
  payload.logger.info(`Seeded ${pages.length} pages`)

  // --- Demo properties -----------------------------------------------------
  if (!seedDemoProperties) {
    payload.logger.info('Skipping demo properties (set SEED_DEMO_PROPERTIES=true to add them)')
    payload.logger.info('Seed complete.')
    process.exit(0)
  }

  for (const [index, property] of demoProperties.entries()) {
    const slug = slugify(property.title)

    const existing = await payload.find({
      collection: 'properties',
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    })

    // Only generate images the first time; re-running should not pile up media.
    let imageIds: number[] = []
    if (existing.docs[0]) {
      const current = existing.docs[0].images
      imageIds = Array.isArray(current)
        ? current.map((image) => (typeof image === 'object' ? image.id : image))
        : []
    }

    if (imageIds.length === 0) {
      const hue = 200 + index * 18
      for (let position = 0; position < 3; position += 1) {
        const media = await payload.create({
          collection: 'media',
          data: {
            alt: `${DEMO_PREFIX} placeholder photograph ${position + 1} of ${property.title}`,
          },
          file: {
            data: await makePlaceholderImage(property.displayLocation, hue + position * 8),
            mimetype: 'image/jpeg',
            name: `demo-${slug}-${position + 1}.jpg`,
            size: 0,
          },
          overrideAccess: true,
        })
        imageIds.push(media.id)
      }
    }

    const data = {
      ...property,
      slug,
      // Makes it unmistakable in the admin list that this is not real stock.
      shortDescription: `${DEMO_PREFIX} ${property.shortDescription}`,
      keyFeatures: property.keyFeatures.map((feature) => ({ feature })),
      images: imageIds,
      townCity: 'Scunthorpe',
      county: 'North Lincolnshire',
      publishedAt: new Date(Date.now() - index * 86_400_000).toISOString(),
    } as never

    if (existing.docs[0]) {
      await payload.update({
        collection: 'properties',
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'properties', data, overrideAccess: true })
    }
  }
  payload.logger.info(`Seeded ${demoProperties.length} demo properties`)

  payload.logger.info('Seed complete.')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
