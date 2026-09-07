import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

/**
 * Rendered per request. Statically generated, this would bake in whatever
 * SITE_NOINDEX was at build time, and the published image is built once and
 * deployed to environments that disagree about whether they may be indexed.
 */
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  // A preview deployment must not be indexed at all.
  if (env.noindex) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The admin panel and the REST API are for staff, not crawlers.
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', env.siteUrl).toString(),
  }
}
