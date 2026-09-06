import React from 'react'

import { Icon, type IconName } from '@/components/ui/Icon'
import { formatAvailability, formatMoney, pluralise } from '@/lib/format'
import { FURNISHED_LABELS, PARKING_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/properties/labels'
import type { PropertyDetail } from '@/lib/properties/types'

interface Fact {
  icon: IconName
  label: string
  value: string
}

/** Only facts the owner actually filled in are shown. */
function buildFacts(property: PropertyDetail): Fact[] {
  const facts: Fact[] = [
    { icon: 'bed', label: 'Bedrooms', value: pluralise(property.bedrooms, 'bedroom') },
    { icon: 'house', label: 'Type', value: PROPERTY_TYPE_LABELS[property.propertyType] },
    { icon: 'clock', label: 'Availability', value: formatAvailability(property.availableFrom) },
  ]

  if (property.bathrooms) {
    facts.splice(1, 0, {
      icon: 'bath',
      label: 'Bathrooms',
      value: pluralise(property.bathrooms, 'bathroom'),
    })
  }
  if (property.furnishedStatus) {
    facts.push({
      icon: 'sofa',
      label: 'Furnishing',
      value: FURNISHED_LABELS[property.furnishedStatus] ?? property.furnishedStatus,
    })
  }
  if (property.deposit) {
    facts.push({ icon: 'pound', label: 'Deposit', value: formatMoney(property.deposit) })
  }
  if (property.epcRating) {
    facts.push({ icon: 'chart', label: 'EPC rating', value: property.epcRating })
  }
  if (property.councilTaxBand) {
    facts.push({ icon: 'document', label: 'Council tax band', value: property.councilTaxBand })
  }
  if (property.parking && property.parking !== 'none') {
    facts.push({ icon: 'car', label: 'Parking', value: PARKING_LABELS[property.parking] })
  }
  if (property.gardenIncluded) {
    facts.push({ icon: 'leaf', label: 'Garden', value: 'Yes' })
  }
  if (property.petsConsidered) {
    facts.push({ icon: 'check', label: 'Pets', value: 'Considered' })
  }

  return facts
}

export function PropertyFacts({ property }: { property: PropertyDetail }) {
  const facts = buildFacts(property)

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
      {facts.map((fact) => (
        <div key={fact.label} className="flex gap-3">
          <Icon name={fact.icon} className="mt-0.5 size-5 shrink-0 text-navy-500" />
          <div>
            <dt className="text-xs tracking-wide text-ink-500 uppercase">{fact.label}</dt>
            <dd className="mt-0.5 font-medium text-ink-900">{fact.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
