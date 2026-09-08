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
    // `lift-card` owns the transform, so the hover lift and the pointer tilt
    // compose instead of overwriting each other. It also carries the shared
    // transition for the shadow and the border.
    <article className="lift-card group relative flex w-full flex-col overflow-hidden rounded-card border border-ink-200 bg-white shadow-card hover:border-transparent hover:shadow-raised focus-within:shadow-raised">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        {image ? (
          <Image
            src={image.cardUrl ?? image.url}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            // Drifts inside the frame as the card crosses the viewport and
            // zooms a little further on hover. See docs/motion.md.
            className="drift-media object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center text-ink-400">
            <Icon name="house" className="size-12" />
            <span className="sr-only">No photo yet</span>
          </div>
        )}

        {/* Five things move on one hover: the card lifts, the photo pushes in,
            this wash deepens, the arrow turns and the shadow spreads. That is
            the difference between a card that responds and one that lights up. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-950/55 to-transparent to-55% opacity-0 transition-opacity duration-400 ease-smooth group-hover:opacity-100"
        />

        <div className="absolute top-3 left-3">
          <PropertyStatusBadge status={property.status} />
        </div>

        <span
          aria-hidden="true"
          className="absolute right-3.5 bottom-3.5 grid size-11 place-items-center rounded-full bg-accent-400 text-navy-950 shadow-raised transition-transform duration-400 ease-smooth group-hover:rotate-45"
        >
          <Icon name="arrow-right" className="size-5" />
        </span>
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

/**
 * The home page's featured properties.
 *
 * A horizontal rail rather than a grid. On a phone each card is just under a
 * screen wide and the track snaps, so a swipe settles on one card at a time
 * with the edge of the next one showing to say there is more. From `sm` up the
 * snap loosens to `proximity`, because on a wide screen a scroll that insists
 * on landing exactly on a card fights the trackpad.
 *
 * Card widths are worked out from the visible width of the rail, so the three
 * featured properties fill a desktop row exactly and there is no scroll and no
 * dead space. Raise the limit in the CMS and it starts scrolling on its own.
 *
 * `scroll-p*` matches the track's own padding, so a snapped card lines up with
 * the heading above it rather than with the bare edge of the window.
 */
export function PropertyRail({
  properties,
  priorityCount = 2,
}: {
  properties: PropertySummary[]
  priorityCount?: number
}) {
  return (
    // Pulled out to the window edges so the rail runs off the side of the
    // screen, which is what makes it read as scrollable, then padded back in
    // so the first card still aligns with the text above it.
    <div className="-mx-5 sm:-mx-6 lg:-mx-8">
      <ul
        className={[
          'rail reveal-group flex snap-x snap-mandatory overflow-x-auto sm:snap-proximity',
          // Vertical room for the hover lift and its shadow, which the
          // horizontal overflow would otherwise clip.
          'gap-5 px-5 py-4 sm:gap-6 sm:px-6 lg:px-8',
          'scroll-px-5 sm:scroll-px-6 lg:scroll-px-8',
        ].join(' ')}
      >
        {properties.map((property, index) => (
          <li
            key={property.id}
            className="flex w-[86%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
          >
            <PropertyCard property={property} priority={index < priorityCount} />
          </li>
        ))}
      </ul>
    </div>
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
    <ul className="reveal-group grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, index) => (
        <li key={property.id} className="flex">
          <PropertyCard property={property} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  )
}
