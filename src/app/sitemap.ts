import type { MetadataRoute } from 'next'

import { env } from '@/lib/env'
import { findAllPageSlugs, findServices } from '@/lib/pages'
import { findAllPropertySlugs } from '@/lib/properties'

/**
 * Built from live CMS content so a new property is discoverable without anyone
 * remembering to update a list.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, properties, services] = await Promise.all([
    findAllPageSlugs(),
    findAllPropertySlugs(),
    findServices(),
  ])

  const url = (path: string) => new URL(path, env.siteUrl).toString()

  return [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/properties'), changeFrequency: 'daily', priority: 0.9 },
    { url: url('/services'), changeFrequency: 'monthly', priority: 0.6 },
    ...properties.map((property) => ({
      url: url(`/properties/${property.slug}`),
      lastModified: new Date(property.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...pages.map((page) => ({
      url: url(`/${page.slug}`),
      lastModified: new Date(page.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...services
      .filter((service): service is typeof service & { slug: string } => Boolean(service.slug))
      .map((service) => ({
        url: url(`/services/${service.slug}`),
        lastModified: new Date(service.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  ]
}
