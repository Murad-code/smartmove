import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { PropertyEnquiryForm } from '@/components/forms/PropertyEnquiryForm'
import { PropertyFacts } from '@/components/property/PropertyFacts'
import { PropertyGallery } from '@/components/property/PropertyGallery'
import { PropertyGrid } from '@/components/property/PropertyCard'
import { JsonLd } from '@/components/seo/JsonLd'
import { PropertyStatusBadge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section } from '@/components/ui/Section'
import { env } from '@/lib/env'
import { formatAvailability, formatRent } from '@/lib/format'
import {
  findAllPropertySlugs,
  findPropertyBySlug,
  findRelatedProperties,
} from '@/lib/properties'
import { buildMetadata } from '@/lib/seo'
import { getBusinessDetails, telHref } from '@/lib/site'
import { breadcrumbSchema, propertySchema } from '@/lib/structured-data'


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await findPropertyBySlug(slug)
  if (!property) return { title: 'Property not found' }

  // Owners often put the area in the title already; only add it when missing.
  const includesLocation = property.title
    .toLowerCase()
    .includes(property.displayLocation.split(',')[0].trim().toLowerCase())

  return buildMetadata({
    title:
      property.seo?.title ||
      (includesLocation ? property.title : `${property.title}, ${property.displayLocation}`),
    description: property.seo?.description || property.shortDescription,
    path: `/properties/${property.slug}`,
    image: property.seo?.image ?? property.mainImage,
  })
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = await findPropertyBySlug(slug)
  if (!property) notFound()

  const [business, related] = await Promise.all([
    getBusinessDetails(),
    findRelatedProperties(property.id, 3),
  ])

  const mapQuery = encodeURIComponent(
    [property.displayLocation, property.postcode].filter(Boolean).join(', '),
  )

  return (
    <>
      <JsonLd data={propertySchema(property, business)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Properties', path: '/properties' },
          { name: property.title, path: `/properties/${property.slug}` },
        ])}
      />

      <Container className="pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
            <li>
              <Link href="/" className="hover:text-navy-700">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <Icon name="chevron-right" className="size-3.5" />
            </li>
            <li>
              <Link href="/properties" className="hover:text-navy-700">
                Properties
              </Link>
            </li>
            <li aria-hidden="true">
              <Icon name="chevron-right" className="size-3.5" />
            </li>
            <li aria-current="page" className="truncate text-ink-700">
              {property.title}
            </li>
          </ol>
        </nav>
      </Container>

      <Container className="py-6 sm:py-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="min-w-0">
            <PropertyGallery images={property.images} title={property.title} />

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <PropertyStatusBadge status={property.status} />
                <span className="text-sm text-ink-500">
                  {formatAvailability(property.availableFrom)}
                </span>
              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl">{property.title}</h1>

              <p className="mt-2 flex items-center gap-2 text-lg text-ink-600">
                <Icon name="pin" className="size-5 shrink-0 text-navy-500" />
                {property.displayLocation}
                {property.postcode ? `, ${property.postcode}` : ''}
              </p>

              {/* One price element for every screen size. Repeating it in the
                  sticky panel would announce the rent twice to a screen
                  reader. */}
              <p className="mt-5 text-3xl font-semibold text-navy-800">
                {formatRent(property.monthlyRent)}
              </p>
            </div>

            <div className="mt-8 rounded-card border border-ink-200 bg-ink-50 p-6">
              <h2 className="sr-only">Property details</h2>
              <PropertyFacts property={property} />
            </div>

            {property.keyFeatures.length ? (
              <div className="mt-10">
                <h2 className="text-2xl">Key features</h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {property.keyFeatures.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Icon name="check" className="mt-1 size-4 shrink-0 text-accent-600" />
                      <span className="text-ink-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10">
              <h2 className="text-2xl">About this property</h2>
              {property.description ? (
                <RichText data={property.description} className="mt-4" />
              ) : (
                <p className="mt-4 text-ink-600">{property.shortDescription}</p>
              )}
            </div>

            {property.postcode ? (
              <p className="mt-8">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 font-medium text-navy-700 underline"
                >
                  <Icon name="pin" className="size-4" />
                  See this area on a map
                </a>
              </p>
            ) : null}

            <p className="mt-10 border-t border-ink-200 pt-6 text-xs leading-relaxed text-ink-500">
              These particulars are a general guide and do not form part of any contract.
              Fixtures, fittings and services have not been tested. Please check anything that
              matters to you when you view.
            </p>
          </div>

          {/* Enquiry panel. Sticky on desktop so the call to action follows a
              long description; a normal block on mobile. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border border-ink-200 bg-white p-6 shadow-card">
              <h2 className="text-xl">Arrange a viewing</h2>
              <p className="mt-1.5 text-sm text-ink-600">
                Send us a message and we will get back to you.
              </p>

              {business.telephone ? (
                <ButtonLink
                  href={telHref(business.telephone)}
                  variant="secondary"
                  fullWidth
                  className="mt-4"
                >
                  <Icon name="phone" className="size-4" />
                  Call {business.telephone}
                </ButtonLink>
              ) : null}

              <div className="mt-6 border-t border-ink-100 pt-6">
                <PropertyEnquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  turnstileSiteKey={env.turnstile.enabled ? env.turnstile.siteKey : undefined}
                />
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {related.length ? (
        <Section background="grey">
          <h2 className="text-2xl sm:text-3xl">Other properties available</h2>
          <div className="mt-8">
            <PropertyGrid properties={related} priorityCount={0} />
          </div>
        </Section>
      ) : null}
    </>
  )
}
