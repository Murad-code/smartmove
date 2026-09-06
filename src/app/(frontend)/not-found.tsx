import type { Metadata } from 'next'
import React from 'react'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <Container className="py-20 text-center sm:py-28">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-navy-50 text-navy-700">
        <Icon name="house" className="size-7" />
      </span>
      <h1 className="mt-6 text-3xl sm:text-4xl">We could not find that page</h1>
      <p className="mx-auto mt-4 max-w-md text-ink-600">
        The page may have moved, or a property may no longer be available. Try browsing what we
        have at the moment.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/properties" size="large">
          See available properties
        </ButtonLink>
        <ButtonLink href="/contact" size="large" variant="secondary">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  )
}
