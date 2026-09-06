import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { findPageBySlug } from '@/lib/pages'
import { toImage } from '@/lib/properties/mappers'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/structured-data'

/**
 * Every CMS page: Landlords, Tenants, About, Contact and the legal pages.
 *
 * Static routes such as `/properties` take precedence over this catch-all, so
 * there is no risk of a page document shadowing a built-in section.
 */

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = await findPageBySlug(slug)
  if (!page) return { title: 'Page not found' }

  return buildMetadata({
    title: page.meta?.title || page.title,
    description: page.meta?.description || page.hero?.subheading,
    path: `/${page.slug}`,
    image: page.meta?.image ?? page.hero?.image,
  })
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await findPageBySlug(slug)
  if (!page) notFound()

  const heroImage = toImage(page.hero?.image)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: page.title, path: `/${page.slug}` },
        ])}
      />

      <div className="relative isolate overflow-hidden border-b border-ink-200 bg-navy-50">
        {heroImage ? (
          <>
            <Image
              src={heroImage.heroUrl ?? heroImage.wideUrl ?? heroImage.url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-navy-950/70" />
          </>
        ) : null}

        <Container className="relative py-12 sm:py-16">
          <h1 className={`text-3xl sm:text-4xl lg:text-5xl ${heroImage ? 'text-white' : ''}`}>
            {page.hero?.heading || page.title}
          </h1>
          {page.hero?.subheading ? (
            <p className={`mt-4 max-w-2xl text-lg ${heroImage ? 'text-navy-100' : 'text-ink-600'}`}>
              {page.hero.subheading}
            </p>
          ) : null}
        </Container>
      </div>

      <RenderBlocks blocks={page.layout} />
    </>
  )
}
