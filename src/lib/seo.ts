import type { Metadata } from 'next'

import { env } from '@/lib/env'
import { getBusinessDetails, getSiteSettings } from '@/lib/site'
import { toImage } from '@/lib/properties/mappers'

/**
 * Builds page metadata from CMS values with sensible defaults, so an editor
 * only ever has to fill the SEO tab when they want to override something.
 */
export async function buildMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: {
  title?: string | null
  description?: string | null
  path: string
  image?: unknown
  noIndex?: boolean
}): Promise<Metadata> {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])

  const suffix = settings.defaultSeo?.titleSuffix || business.companyName
  const resolvedTitle = title ? (title.includes(suffix) ? title : `${title} | ${suffix}`) : suffix
  const resolvedDescription =
    description || settings.defaultSeo?.description || business.tagline || undefined

  const shareImage = toImage(image) ?? toImage(settings.defaultSeo?.shareImage)
  const url = new URL(path, env.siteUrl).toString()

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: 'website',
      siteName: business.companyName,
      locale: 'en_GB',
      title: resolvedTitle,
      description: resolvedDescription,
      url,
      ...(shareImage
        ? {
            images: [
              {
                url: new URL(shareImage.wideUrl ?? shareImage.url, env.siteUrl).toString(),
                alt: shareImage.alt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: shareImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
    },
  }
}
