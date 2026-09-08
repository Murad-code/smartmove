import { headers } from 'next/headers'
import { cache } from 'react'

import type { User } from '@/payload-types'

import { getPayloadClient } from './payload'
import { previewOptions } from './preview'

/**
 * Who is asking for preview content. See preview.ts for the shape of the
 * feature; this is the half that decides whether the flag grants anything.
 *
 * These are the only website queries that run as a signed-in user rather than
 * anonymously.
 */

/**
 * The member of staff behind this request, or null. Cached per request so the
 * page body and `generateMetadata` share one session lookup.
 */
export const previewUser = cache(async (): Promise<User | null> => {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || user.collection !== 'users') return null
  return user.role === 'admin' || user.role === 'editor' ? user : null
})

/** Options to thread into a content query. Cached so callers share one lookup. */
export const previewQuery = cache(async (requested: boolean) =>
  previewOptions(requested ? await previewUser() : null),
)
