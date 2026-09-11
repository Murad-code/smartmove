import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { LivePreview } from '@/components/layout/LivePreview'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/cn'
import { findPageBySlug } from '@/lib/pages'
import { previewRequested } from '@/lib/preview'
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

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = await findPageBySlug(slug, previewRequested(await searchParams))
  if (!page) return { title: 'Page not found' }

  return buildMetadata({
    title: page.meta?.title || page.title,
    description: page.meta?.description || page.hero?.subheading,
    path: `/${page.slug}`,
    image: page.meta?.image ?? page.hero?.image,
  })
}

export default async function CmsPage({ params, searchParams }: Props) {
  const { slug } = await params
  const preview = previewRequested(await searchParams)
  const page = await findPageBySlug(slug, preview)
  if (!page) notFound()

  const heroImage = toImage(page.hero?.image)

  return (
    <>
      <LivePreview enabled={preview} />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: page.title, path: `/${page.slug}` },
        ])}
      />

      <div
        data-page-header={heroImage ? 'with-photo' : 'plain'}
        className={cn(
          'relative isolate overflow-hidden border-b border-ink-200 bg-navy-50',
          // Without a photo the band is only as tall as the heading. A photo
          // needs a real frame or object-cover crops it to a thin strip.
          heroImage && 'flex min-h-[40svh] items-end sm:min-h-[28rem] lg:min-h-[38rem]',
        )}
      >
        {heroImage ? (
          <>
            <Image
              src={heroImage.heroUrl ?? heroImage.wideUrl ?? heroImage.url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-navy-950/70" />
          </>
        ) : null}

        <Container
          className={cn(
            'relative',
            heroImage ? 'w-full py-16 sm:py-20 lg:py-24' : 'py-12 sm:py-16',
          )}
        >
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
