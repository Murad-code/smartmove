import React from 'react'

import { Icon } from './Icon'

/**
 * Customer reviews.
 *
 * Shared by the home page global and the `testimonials` page block, so the
 * two never drift apart visually.
 */

export type Testimonial = {
  id?: string | null
  quote: string
  name: string
  role?: string | null
}

const ROLE_LABELS: Record<string, string> = {
  tenant: 'Tenant',
  landlord: 'Landlord',
  seller: 'Seller',
}

export function TestimonialGrid({ items }: { items: Testimonial[] }) {
  if (!items.length) return null

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, position) => (
        <li key={item.id ?? position} className="flex">
          <figure className="reveal flex flex-col rounded-card border border-ink-200 bg-white p-6 shadow-card">
            <Icon name="quote" className="size-7 shrink-0 text-accent-400" />
            <blockquote className="mt-4 flex-1 text-ink-700">
              <p>{item.quote}</p>
            </blockquote>
            <figcaption className="mt-6 border-t border-ink-100 pt-4">
              <p className="font-semibold text-navy-900">{item.name}</p>
              {item.role && ROLE_LABELS[item.role] ? (
                <p className="text-sm text-ink-500">{ROLE_LABELS[item.role]}</p>
              ) : null}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
