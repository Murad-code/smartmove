import fs from 'node:fs/promises'
import path from 'node:path'

import type { Payload } from 'payload'

import { buildDemoProperties } from './demo-properties'
import { businessDetails, homePage, pages, services, siteSettings } from './seed-content'

/**
 * The seed itself, as a function.
 *
 * Kept separate from the `pnpm seed` entry point because production runs it a
 * different way. The Next.js standalone build inlines the Payload config into
 * its own server chunks, so a standalone script cannot resolve `payload` at
 * runtime; `src/instrumentation.ts` calls this instead, from inside the server
 * process where every import already resolves. See docs/deployment.md.
 *
 * Idempotent: running it twice updates rather than duplicates, so it is safe
 * to re-run after changing the content in `seed-content.ts`.
 *
 * The admin user, business details, services and pages are always written,
 * which is exactly what a first deployment needs. Brand marks in
 * `demo-assets/brand` come from the live smartmove4u.co.uk logo. The six demo
 * properties are development scaffolding and are only written when
 * SEED_DEMO_PROPERTIES=true, so a real site never starts with fake stock.
 */

// The production image copies the assets to a fixed path rather than keeping
// the source tree, so the location is overridable.
const ASSET_DIR = process.env.SEED_ASSET_DIR
  ? path.resolve(process.env.SEED_ASSET_DIR)
  : path.resolve(process.cwd(), 'src/scripts/demo-assets')
const BRAND_DIR = path.join(ASSET_DIR, 'brand')

async function upsertBrandImage(
  payload: Payload,
  {
    filename,
    alt,
  }: {
    filename: string
    alt: string
  },
): Promise<number> {
  const existing = await payload.find({
    collection: 'media',
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) return existing.docs[0].id

  const filePath = path.join(BRAND_DIR, filename)
  const data = await fs.readFile(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: 'image/png',
      name: filename,
      size: data.byteLength,
    },
    overrideAccess: true,
  })

  return media.id
}

export type RunSeedOptions = {
  /**
   * Load the third-party demo listings. Used by the admin dashboard button on
   * a noindex preview. Boot-time seeding still follows the environment flags.
   */
  includeDemoProperties?: boolean
}

export async function runSeed(payload: Payload, options: RunSeedOptions = {}): Promise<void> {
  const seedDemoProperties =
    options.includeDemoProperties === true || process.env.SEED_DEMO_PROPERTIES === 'true'

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
  const [logoId, logoLightId, faviconId] = await Promise.all([
    upsertBrandImage(payload, {
      filename: 'logo.png',
      alt: 'Smart Move logo',
    }),
    upsertBrandImage(payload, {
      filename: 'logo-light.png',
      alt: 'Smart Move logo for dark backgrounds',
    }),
    upsertBrandImage(payload, {
      filename: 'favicon.png',
      alt: 'Smart Move browser tab icon',
    }),
  ])

  await payload.updateGlobal({
    slug: 'business-details',
    data: businessDetails,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      ...siteSettings,
      logo: logoId,
      logoLight: logoLightId,
      favicon: faviconId,
    },
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
    return
  }

  // The demo particulars and photographs belong to the agency that published
  // them, so a production build will not publish them by accident. A private,
  // password-protected preview is a legitimate use, and the flag that allows
  // it is named so it cannot be set without meaning to.
  const acknowledged = process.env.SEED_DEMO_PROPERTIES_THIRD_PARTY_ACKNOWLEDGED === 'true'

  if (
    options.includeDemoProperties !== true &&
    process.env.NODE_ENV === 'production' &&
    !acknowledged
  ) {
    payload.logger.warn(
      'Skipping demo properties: this is a production build and they use ' +
        'third-party photographs and particulars. For a private preview set ' +
        'SEED_DEMO_PROPERTIES_THIRD_PARTY_ACKNOWLEDGED=true and keep the site ' +
        'behind a password with SITE_NOINDEX=true.',
    )
    payload.logger.info('Seed complete.')
    return
  }

  const demoProperties = buildDemoProperties()

  for (const property of demoProperties) {
    const existing = await payload.find({
      collection: 'properties',
      where: { slug: { equals: property.slug } },
      limit: 1,
      overrideAccess: true,
    })

    // Only upload the first time; re-running should not pile up media.
    let imageIds: number[] = []
    if (existing.docs[0]) {
      const current = existing.docs[0].images
      imageIds = Array.isArray(current)
        ? current.map((image) => (typeof image === 'object' ? image.id : image))
        : []
    }

    if (imageIds.length === 0) {
      for (const image of property.images) {
        const file = path.join(ASSET_DIR, property.slug, image.file)
        const media = await payload.create({
          collection: 'media',
          data: { alt: image.alt },
          file: {
            data: await fs.readFile(file),
            mimetype: 'image/jpeg',
            name: `${property.slug}-${image.file}`,
            size: 0,
          },
          overrideAccess: true,
        })
        imageIds.push(media.id)
      }
    }

    const data = { ...property.data, images: imageIds } as never

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
  payload.logger.warn(
    'Demo properties use photographs and particulars from a third-party website. ' +
      "Delete them and replace with Smart Move's own before this site goes live.",
  )

  payload.logger.info('Seed complete.')
}
