import fs from 'node:fs/promises'
import path from 'node:path'

import type { Payload } from 'payload'

import { env } from '@/lib/env'
import { configuredRootEmail, configuredRootPassword } from '@/lib/root-user'

import { buildDemoProperties } from './demo-properties'
import {
  businessDetails,
  demoHomeTestimonials,
  homePage,
  pages,
  services,
  siteSettings,
} from './seed-content'

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
 * On every boot the root account from ROOT_ADMIN_EMAIL is created if it is
 * missing. An empty database also gets the starter pages, services and
 * business details. `SEED_DEMO=true` adds the demonstration listings and
 * photography on top. Nothing the demo writes is Smart Move's, so a site
 * running with it set should also have SITE_NOINDEX=true.
 *
 * ROOT_ADMIN_PASSWORD is still accepted as SEED_ADMIN_PASSWORD so existing
 * servers keep working.
 */

// The production image copies the assets to a fixed path rather than keeping
// the source tree, so the location is overridable.
const ASSET_DIR = process.env.SEED_ASSET_DIR
  ? path.resolve(process.env.SEED_ASSET_DIR)
  : path.resolve(process.cwd(), 'src/scripts/demo-assets')
const BRAND_DIR = path.join(ASSET_DIR, 'brand')

async function upsertImage(
  payload: Payload,
  {
    filePath,
    filename,
    alt,
  }: {
    filePath: string
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

  // `alt` is the identity: the seed re-runs on every boot of a demo box, so
  // this has to be a no-op once the image is there. Comparing file sizes to
  // spot an edited source does not work, because what is stored is Payload's
  // WebP conversion rather than the bytes on disk, and re-uploading coins a
  // new filename rather than replacing the old one. To swap an image, give it
  // a new `alt` here, or delete it in the admin panel and re-seed.
  if (existing.docs[0]) return existing.docs[0].id

  const data = await fs.readFile(filePath)
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    file: {
      data,
      mimetype: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
      name: filename,
      size: data.byteLength,
    },
    overrideAccess: true,
  })

  return media.id
}

function upsertBrandImage(
  payload: Payload,
  { filename, alt }: { filename: string; alt: string },
): Promise<number> {
  return upsertImage(payload, { filePath: path.join(BRAND_DIR, filename), filename, alt })
}

/**
 * Photographs for the home page.
 *
 * These come out of the demo listings, so they carry exactly the same
 * restriction: they only appear when SEED_DEMO is on. The office photograph is
 * separate, and is seeded either way.
 */
const HOME_SCENES = {
  heroOne: {
    file: 'langley-drive-scunthorpe/01.jpg',
    alt: 'Detached house with a bay window and a front lawn on a Scunthorpe street',
  },
  heroTwo: {
    file: 'st-johns-road-scunthorpe/01.jpg',
    alt: 'Brick end-terrace house behind a low garden wall',
  },
  heroThree: {
    file: 'langley-drive-scunthorpe/03.jpg',
    alt: 'Living room with a wooden floor, an armchair and a bright window',
  },
  landlords: {
    file: 'horbury-close-scunthorpe/01.jpg',
    alt: 'Semi-detached house with a driveway and a lawn to the front',
  },
  tenants: {
    file: 'st-johns-road-scunthorpe/02.jpg',
    alt: 'Furnished living room with a fireplace and a corner sofa',
  },
} as const

type HomeScene = keyof typeof HOME_SCENES

/** The order the hero slides in `seed-content.ts` expect their photographs. */
const HERO_ORDER = ['heroOne', 'heroTwo', 'heroThree'] as const

async function upsertHomeScenes(payload: Payload): Promise<Record<HomeScene, number>> {
  const entries = await Promise.all(
    (Object.keys(HOME_SCENES) as HomeScene[]).map(
      async (key) =>
        [
          key,
          await upsertImage(payload, {
            filePath: path.join(ASSET_DIR, HOME_SCENES[key].file),
            filename: `home-${key}.jpg`,
            alt: HOME_SCENES[key].alt,
          }),
        ] as const,
    ),
  )

  return Object.fromEntries(entries) as Record<HomeScene, number>
}

export type RunSeedOptions = {
  /**
   * Load the demonstration site regardless of `SEED_DEMO`. Used by the admin
   * dashboard button, which does its own permission check.
   */
  demo?: boolean
}

/**
 * Create the hidden owner account if it does not already exist.
 * Does not reset the password of an account that is already there.
 */
export async function ensureRootUser(payload: Payload): Promise<void> {
  const email = configuredRootEmail()
  const password = configuredRootPassword()

  if (!email) {
    throw new Error('Set ROOT_ADMIN_EMAIL before starting the site.')
  }

  const existingUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  if (existingUsers.docs.length > 0) {
    payload.logger.info(`Root user ${email} already exists`)
    return
  }

  if (!password) {
    throw new Error('Set ROOT_ADMIN_PASSWORD to create the owner account.')
  }

  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Root', role: 'admin' },
    overrideAccess: true,
  })
  payload.logger.info(`Created root user ${email}`)
}

export async function runSeed(payload: Payload, options: RunSeedOptions = {}): Promise<void> {
  // One decision, taken once. The home page photography comes out of the same
  // listings as the demo properties, so both have to obey the same answer.
  const useDemoContent = options.demo ?? env.seedDemo

  await ensureRootUser(payload)

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

  // The alt is deliberately not the street address: this is a generated
  // shopfront, and the door number on it is not Frodingham Road's.
  const officeId = await upsertBrandImage(payload, {
    filename: 'office.jpg',
    alt: 'The Smart Move office, a corner shopfront with property cards in the window',
  })
  const scenes = useDemoContent ? await upsertHomeScenes(payload) : null

  await payload.updateGlobal({
    slug: 'home-page',
    // The generated global type is stricter than the plain seed literals, and
    // asserting once here is clearer than annotating every nested group.
    data: {
      ...homePage,
      hero: {
        ...homePage.hero,
        slides: homePage.hero.slides.map((slide, position) => {
          const key = HERO_ORDER[position]
          return { ...slide, image: scenes && key ? scenes[key] : undefined }
        }),
      },
      intro: { ...homePage.intro, image: officeId },
      landlords: { ...homePage.landlords, image: scenes?.landlords },
      tenants: { ...homePage.tenants, image: scenes?.tenants },
      testimonials: useDemoContent ? demoHomeTestimonials : homePage.testimonials,
    } as never,
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
  if (!useDemoContent) {
    payload.logger.info('Skipping the demo listings (set SEED_DEMO=true to add them)')
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
  // This can now fire in production, so it has to say everything that is not
  // Smart Move's, not just the listings.
  payload.logger.warn(
    'SEED_DEMO is on. The listings and the home page photography use images and ' +
      'particulars belonging to a third-party agency, and the home page reviews ' +
      'are invented. Keep SITE_NOINDEX=true, and clear SEED_DEMO before this ' +
      'becomes a real client site.',
  )

  payload.logger.info('Seed complete.')
}
