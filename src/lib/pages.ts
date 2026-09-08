import { cache } from 'react'

import { getPayloadClient } from './payload'
import { previewQuery } from './preview-session'

/** Page and service lookups, deduped per request like the globals. */

export const findPageBySlug = cache(async (slug: string, preview = false) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
    ...(await previewQuery(preview)),
  })
  return result.docs[0] ?? null
})

export const findAllPageSlugs = cache(async () => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 200,
    select: { slug: true, updatedAt: true },
    overrideAccess: false,
  })
  return result.docs
    .filter((doc): doc is typeof doc & { slug: string } => Boolean(doc.slug))
    .map((doc) => ({ slug: doc.slug, updatedAt: doc.updatedAt }))
})

export const findServiceBySlug = cache(async (slug: string, preview = false) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    overrideAccess: false,
    ...(await previewQuery(preview)),
  })
  return result.docs[0] ?? null
})

export const findServices = cache(async () => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'services',
    sort: 'order',
    depth: 1,
    limit: 50,
    overrideAccess: false,
  })
  return result.docs
})
