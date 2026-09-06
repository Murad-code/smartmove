import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { PropertyStatusBadge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { formatRent, pluralise } from '@/lib/format'
import { PROPERTY_TYPE_LABELS } from '@/lib/properties/labels'
import type { PropertySummary } from '@/lib/properties/types'

/**
 * A property card.
 *
 * The whole card is one link with the heading as its accessible name; the
 * `after:absolute` overlay is what makes the surrounding area clickable
 * without nesting interactive elements.
 */
export function PropertyCard({
  property,
  priority = false,
}: {
  property: PropertySummary
  priority?: boolean
}) {
  const image = property.mainImage

  return (
    <article className="group relative flex w-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-raised focus-within:shadow-raised">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {image ? (
          <Image
            src={image.cardUrl ?? image.url}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-400">
            <Icon name="house" className="size-12" />
            <span className="sr-only">No photo yet</span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <PropertyStatusBadge status={property.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xl font-semibold text-navy-800">{formatRent(property.monthlyRent)}</p>

        <h3 className="mt-1.5 text-lg leading-snug">
          <Link
            href={`/properties/${property.slug}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {property.title}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
          <Icon name="pin" className="size-4 shrink-0" />
          {property.displayLocation}
        </p>

        <p className="mt-3 line-clamp-2 text-sm text-ink-600">{property.shortDescription}</p>

        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink-100 pt-4 text-sm text-ink-700">
          <div className="flex items-center gap-1.5">
            <Icon name="bed" className="size-4 text-navy-500" />
            <dt className="sr-only">Bedrooms</dt>
            <dd>{pluralise(property.bedrooms, 'bed')}</dd>
          </div>
          {property.bathrooms ? (
            <div className="flex items-center gap-1.5">
              <Icon name="bath" className="size-4 text-navy-500" />
              <dt className="sr-only">Bathrooms</dt>
              <dd>{pluralise(property.bathrooms, 'bath')}</dd>
            </div>
          ) : null}
          <div className="flex items-center gap-1.5">
            <Icon name="house" className="size-4 text-navy-500" />
            <dt className="sr-only">Property type</dt>
            <dd>{PROPERTY_TYPE_LABELS[property.propertyType]}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}

export function PropertyGrid({
  properties,
  priorityCount = 3,
}: {
  properties: PropertySummary[]
  priorityCount?: number
}) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <li key={property.id} className="flex">
          <PropertyCard property={property} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
