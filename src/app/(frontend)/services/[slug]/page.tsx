import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { LivePreview } from '@/components/layout/LivePreview'
import { JsonLd } from '@/components/seo/JsonLd'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { findServiceBySlug } from '@/lib/pages'
import { previewRequested } from '@/lib/preview'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/structured-data'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await findServiceBySlug(slug, previewRequested(await searchParams))
  if (!service) return { title: 'Service not found' }

  return buildMetadata({
    title: service.meta?.title || service.title,
    description: service.meta?.description || service.summary,
    path: `/services/${service.slug}`,
    image: service.meta?.image,
  })
}

export default async function ServiceDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const preview = previewRequested(await searchParams)
  const service = await findServiceBySlug(slug, preview)
  if (!service) notFound()

  return (
    <>
      <LivePreview enabled={preview} />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title, path: `/services/${service.slug}` },
        ])}
      />

      <div className="border-b border-ink-200 bg-navy-50">
        <Container className="py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-5">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-navy-700"
            >
              <Icon name="chevron-left" className="size-4" />
              All services
            </Link>
          </nav>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">{service.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">{service.summary}</p>
        </Container>
      </div>

      <RenderBlocks blocks={service.layout} />
    </>
  )
}
