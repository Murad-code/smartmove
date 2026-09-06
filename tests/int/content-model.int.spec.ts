import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { PUBLIC_PROPERTY_STATUSES } from '@/collections/Properties'

/**
 * Checks the content model behaves the way the website relies on. Runs against
 * the development database, so `pnpm seed` should have been run first.
 */

let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('properties collection', () => {
  it('generates a slug from the title', async () => {
    const created = await payload.create({
      collection: 'properties',
      data: {
        title: 'Test Property For Slug Generation',
        status: 'draft',
        monthlyRent: 500,
        bedrooms: 2,
        propertyType: 'terraced',
        displayLocation: 'Test area',
        shortDescription: 'A property created by the automated test suite.',
      },
      overrideAccess: true,
    })

    expect(created.slug).toBe('test-property-for-slug-generation')

    await payload.delete({ collection: 'properties', id: created.id, overrideAccess: true })
  })

  it('sets the published date automatically', async () => {
    const created = await payload.create({
      collection: 'properties',
      data: {
        title: 'Test Property For Published Date',
        status: 'draft',
        monthlyRent: 500,
        bedrooms: 2,
        propertyType: 'flat',
        displayLocation: 'Test area',
        shortDescription: 'A property created by the automated test suite.',
      },
      overrideAccess: true,
    })

    expect(created.publishedAt).toBeTruthy()

    await payload.delete({ collection: 'properties', id: created.id, overrideAccess: true })
  })

  it('hides let and draft properties from visitors', async () => {
    const created = await payload.create({
      collection: 'properties',
      data: {
        title: 'Test Property That Should Be Hidden',
        status: 'let',
        monthlyRent: 500,
        bedrooms: 2,
        propertyType: 'flat',
        displayLocation: 'Test area',
        shortDescription: 'A property created by the automated test suite.',
      },
      overrideAccess: true,
    })

    // `overrideAccess: false` with no user is exactly what the website does.
    const publicView = await payload.find({
      collection: 'properties',
      where: { slug: { equals: created.slug } },
      overrideAccess: false,
    })

    expect(publicView.docs).toHaveLength(0)

    await payload.delete({ collection: 'properties', id: created.id, overrideAccess: true })
  })

  it('only ever returns publishable statuses to visitors', async () => {
    const publicView = await payload.find({
      collection: 'properties',
      limit: 100,
      overrideAccess: false,
    })

    for (const property of publicView.docs) {
      expect(PUBLIC_PROPERTY_STATUSES).toContain(property.status)
    }
  })
})

describe('enquiries collection', () => {
  it('refuses creation through the public API', async () => {
    await expect(
      payload.create({
        collection: 'enquiries',
        data: {
          kind: 'general',
          name: 'Spam Bot',
          email: 'bot@example.com',
          message: 'Injected directly',
        },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('hides enquiries from visitors', async () => {
    await expect(
      payload.find({ collection: 'enquiries', overrideAccess: false }),
    ).rejects.toThrow()
  })
})

describe('globals', () => {
  it('exposes business details publicly, because the footer needs them', async () => {
    const business = await payload.findGlobal({
      slug: 'business-details',
      overrideAccess: false,
    })

    expect(business.companyName).toBeTruthy()
  })
})
