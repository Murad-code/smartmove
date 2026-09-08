import { describe, expect, it } from 'vitest'

import { PREVIEW_PARAM, previewOptions, previewRequested, previewUrl } from '@/lib/preview'
import config from '@/payload.config'

/**
 * Live preview is only as good as the wiring between the admin panel and the
 * website. These pin the two halves together: the entities that get a preview
 * pane, and the URLs it loads.
 */

const sanitised = await config

const livePreview = sanitised.admin.livePreview

describe('live preview configuration', () => {
  it('is enabled for every collection with a page on the website', () => {
    // Root-level live preview does nothing unless the entity is listed, so an
    // omission here is silent in the admin panel.
    expect(livePreview?.collections).toEqual(
      expect.arrayContaining(['pages', 'services', 'properties']),
    )
    expect(livePreview?.globals).toEqual(expect.arrayContaining(['home-page']))
  })

  it('is not offered for content with no page of its own', () => {
    expect(livePreview?.collections).not.toContain('enquiries')
    expect(livePreview?.collections).not.toContain('media')
    expect(livePreview?.collections).not.toContain('users')
    expect(livePreview?.globals).not.toContain('business-details')
  })

  it('offers a phone, tablet and desktop width', () => {
    expect(livePreview?.breakpoints?.map((breakpoint) => breakpoint.name)).toEqual([
      'mobile',
      'tablet',
      'desktop',
    ])
  })
})

describe('live preview URLs', () => {
  /**
   * The URL function reads only the slug and which entity the document belongs
   * to, so a stub of that shape is enough. Payload's own argument type carries
   * a whole request with it, hence the one cast.
   */
  async function resolve(args: {
    collectionConfig?: { slug: string }
    globalConfig?: { slug: string }
    data?: Record<string, unknown>
  }): Promise<string> {
    const url = livePreview?.url
    if (typeof url !== 'function') throw new Error('Live preview URL must be a function')

    const resolved = await url(args as never)
    if (typeof resolved !== 'string') throw new Error('Every previewable entity needs a URL')
    return resolved
  }

  it('points each collection at its own route, in preview mode', async () => {
    const data = { slug: 'ashby-high-street' }

    await expect(resolve({ collectionConfig: { slug: 'properties' }, data })).resolves.toMatch(
      /\/properties\/ashby-high-street\?preview=true$/,
    )
    await expect(resolve({ collectionConfig: { slug: 'services' }, data })).resolves.toMatch(
      /\/services\/ashby-high-street\?preview=true$/,
    )
    await expect(resolve({ collectionConfig: { slug: 'pages' }, data })).resolves.toMatch(
      /\/ashby-high-street\?preview=true$/,
    )
  })

  it('points the home page global at the site root', async () => {
    await expect(resolve({ globalConfig: { slug: 'home-page' }, data: {} })).resolves.toMatch(
      /\/\?preview=true$/,
    )
  })
})

describe('previewOptions', () => {
  it('grants nothing without a signed-in member of staff', () => {
    // The flag is public, so this is the whole guard: no user, no drafts and
    // no elevated read. Anonymous preview must be the ordinary page query.
    expect(previewOptions(null)).toEqual({ draft: false, user: undefined })
  })

  it('reads drafts as the member of staff who asked', () => {
    const user = { id: 1, email: 'owner@example.com', role: 'editor' } as never
    expect(previewOptions(user)).toEqual({ draft: true, user })
  })
})

describe('previewRequested', () => {
  it('only recognises the flag the preview URLs actually set', () => {
    expect(previewRequested({ [PREVIEW_PARAM]: 'true' })).toBe(true)
    expect(previewRequested({ [PREVIEW_PARAM]: '1' })).toBe(false)
    expect(previewRequested({})).toBe(false)
  })

  it('accepts the URLs the admin panel builds', () => {
    const { searchParams } = new URL(previewUrl('/properties/example'))
    expect(previewRequested(Object.fromEntries(searchParams))).toBe(true)
  })
})
