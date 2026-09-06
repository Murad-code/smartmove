import type { Metadata } from 'next'
import Link from 'next/link'
import React, { Suspense } from 'react'

import { PropertyGrid } from '@/components/property/PropertyCard'
import { PropertyFilters } from '@/components/property/PropertyFilters'
import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { Pagination } from '@/components/ui/Pagination'
import { Section } from '@/components/ui/Section'
import { PROPERTIES_PER_PAGE, describeFilters, findProperties } from '@/lib/properties'
import {
  buildQuery,
  hasActiveFilters,
  parseFilters,
  parsePage,
  type SearchParams,
} from '@/lib/properties/filters'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/structured-data'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const filters = parseFilters(await searchParams)

  return buildMetadata({
    title: 'Properties to rent in Scunthorpe',
    description:
      'Browse houses, flats and bungalows available to rent through Smart Move in Scunthorpe and North Lincolnshire.',
    path: '/properties',
    // Filtered views are near-duplicates of the main listing, so only the
    // unfiltered page is offered to search engines.
    noIndex: hasActiveFilters(filters),
  })
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  const page = parsePage(params)

  const { properties, totalDocs, totalPages } = await findProperties(
    filters,
    page,
    PROPERTIES_PER_PAGE,
  )

  const description = describeFilters(filters)

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Properties', path: '/properties' },
        ])}
      />

      <div className="border-b border-ink-200 bg-navy-50">
        <Container className="py-10 sm:py-14">
          <h1 className="text-3xl sm:text-4xl">Properties to rent</h1>
          <p className="mt-3 max-w-2xl text-lg text-ink-600">
            Everything we currently have available across Scunthorpe and North Lincolnshire.
          </p>
        </Container>
      </div>

      <Section spacing="tight">
        {/* `useSearchParams` needs a Suspense boundary during streaming. */}
        <Suspense fallback={<div className="h-40 rounded-card bg-ink-50" />}>
          <PropertyFilters resultCount={totalDocs} />
        </Suspense>

        <div className="mt-10">
          {/* The cards are h3s, so the results need an h2 above them to keep
              the heading order unbroken for screen-reader navigation. */}
          <h2 className="sr-only">Available properties</h2>
          {properties.length ? (
            <>
              <PropertyGrid properties={properties} />
              <Pagination
                page={page}
                totalPages={totalPages}
                buildHref={(target) => `/properties${buildQuery(filters, target)}`}
              />
            </>
          ) : (
            <div className="rounded-card border border-dashed border-ink-300 bg-white px-6 py-14 text-center">
              <Icon name="house" className="mx-auto size-12 text-ink-400" />
              <h2 className="mt-4 text-xl">
                {description
                  ? `No properties match ${description}`
                  : 'No properties available at the moment'}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-ink-600">
                Our stock changes regularly. Tell us what you are looking for and we will contact
                you as soon as something suitable comes up.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/register-interest" size="large">
                  Register your requirements
                </ButtonLink>
                {hasActiveFilters(filters) ? (
                  <Link
                    href="/properties"
                    className="inline-flex items-center rounded-lg border border-ink-300 px-5 py-2.5 font-semibold text-navy-800 hover:bg-navy-50"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
