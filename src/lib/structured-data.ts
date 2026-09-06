import type { BusinessDetail } from '@/payload-types'
import { env } from '@/lib/env'
import type { PropertyDetail } from '@/lib/properties/types'

/**
 * Schema.org helpers.
 *
 * Only facts that exist in the CMS are emitted. No ratings or review counts:
 * inventing those is both dishonest and against Google's guidelines.
 */

export function realEstateAgentSchema(business: BusinessDetail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${env.siteUrl}/#organisation`,
    name: business.companyName,
    url: env.siteUrl,
    ...(business.tagline ? { description: business.tagline } : {}),
    ...(business.telephone ? { telephone: business.telephone } : {}),
    ...(business.email ? { email: business.email } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [business.address?.line1, business.address?.line2].filter(Boolean).join(', '),
      addressLocality: business.address?.town,
      addressRegion: business.address?.county ?? undefined,
      postalCode: business.address?.postcode,
      addressCountry: 'GB',
    },
    ...(business.openingHours?.length
      ? {
          openingHours: business.openingHours.map((row) => `${row.days} ${row.hours}`),
        }
      : {}),
    areaServed: {
      '@type': 'City',
      name: business.address?.town || 'Scunthorpe',
    },
  }
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.path, env.siteUrl).toString(),
    })),
  }
}

/**
 * A rental listing is modelled as a `RealEstateListing` about an
 * `Accommodation`. `Offer` carries the rent with its billing period.
 */
export function propertySchema(property: PropertyDetail, business: BusinessDetail) {
  const url = `${env.siteUrl}/properties/${property.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    url,
    name: property.title,
    description: property.shortDescription,
    datePosted: property.publishedAt ?? property.updatedAt,
    ...(property.images.length
      ? {
          image: property.images
            .slice(0, 6)
            .map((image) => new URL(image.url, env.siteUrl).toString()),
        }
      : {}),
    provider: {
      '@type': 'RealEstateAgent',
      name: business.companyName,
      telephone: business.telephone,
    },
    about: {
      '@type': 'Accommodation',
      name: property.title,
      numberOfBedrooms: property.bedrooms,
      ...(property.bathrooms ? { numberOfBathroomsTotal: property.bathrooms } : {}),
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.townCity || business.address?.town,
        ...(property.postcode ? { postalCode: property.postcode } : {}),
        addressCountry: 'GB',
      },
    },
    offers: {
      '@type': 'Offer',
      price: property.monthlyRent,
      priceCurrency: 'GBP',
      availability:
        property.status === 'available'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: property.monthlyRent,
        priceCurrency: 'GBP',
        unitCode: 'MON',
        billingDuration: 1,
      },
    },
  }
}
