import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The admin panel and the Payload REST API are for staff, not crawlers.
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', env.siteUrl).toString(),
  }
}
