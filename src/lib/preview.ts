/**
 * Live preview.
 *
 * The admin panel loads the website in an iframe next to the editing form and
 * refreshes it whenever the document is saved, so the owner can see a page
 * take shape without leaving the CMS.
 *
 * A previewed URL carries `?preview=true`. That flag only *asks* for
 * unpublished content; the request's own Payload session cookie decides
 * whether it may have it, in `preview-session.ts`. A visitor who guesses the
 * flag is anonymous, so they get exactly the published page they would have
 * got without it.
 *
 * Nothing here may import the Payload client: `payload.config.ts` builds
 * preview URLs from this module, and importing the client back would close a
 * cycle through `@payload-config`.
 */

import type { User } from '@/payload-types'

import { env } from './env'

export const PREVIEW_PARAM = 'preview'

type SearchParams = Record<string, string | string[] | undefined>

/** A website URL to load in the live preview pane. */
export function previewUrl(pathname: string): string {
  return `${env.siteUrl}${pathname}?${PREVIEW_PARAM}=true`
}

/** Did this request ask for preview content? Says nothing about permission. */
export function previewRequested(searchParams: SearchParams): boolean {
  return searchParams[PREVIEW_PARAM] === 'true'
}

/**
 * What a preview request is allowed to see. Only a signed-in member of staff
 * turns the flag into anything: `draft` reads the newest autosaved version,
 * and `user` is what makes an unpublished document readable at all. Pass null
 * and the query is the anonymous one every other page runs.
 */
export function previewOptions(user: User | null) {
  return { draft: Boolean(user), user: user ?? undefined }
}
