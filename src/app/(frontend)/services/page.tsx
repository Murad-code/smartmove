import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@/components/seo/JsonLd'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon, type IconName } from '@/components/ui/Icon'
import { Section } from '@/components/ui/Section'
import { findServices } from '@/lib/pages'
import { buildMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/structured-data'

const AUDIENCE_LABELS: Record<string, string> = {
  landlords: 'For landlords',
  tenants: 'For tenants',
  everyone: 'For everyone',
}

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: 'Our services',
    description:
      'Lettings, property management, tenant finding and more from Smart Move in Scunthorpe.',
    path: '/services',
  })
}

export default async function ServicesPage() {
  const services = await findServices()

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />

      <div className="border-b border-ink-200 bg-navy-50">
        <Container className="py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">Our services</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Whether you are letting a property out or looking for somewhere to live, here is how
            we can help.
          </p>
        </Container>
      </div>

      <Section>
        {services.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="flex">
                <article className="group relative flex w-full flex-col rounded-card border border-ink-200 bg-white p-6 shadow-card transition-shadow hover:shadow-raised">
                  <span className="grid size-11 place-items-center rounded-lg bg-navy-50 text-navy-700">
                    <Icon name={(service.icon as IconName) ?? 'key'} />
                  </span>
                  {service.audience ? (
                    <p className="mt-4 text-xs font-semibold tracking-wider text-accent-700 uppercase">
                      {AUDIENCE_LABELS[service.audience] ?? ''}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-xl">
                    <Link
                      href={`/services/${service.slug}`}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {service.title}
                    </Link>
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-ink-600">{service.summary}</p>
                  <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy-700">
                    Read more
                    <Icon name="arrow-right" className="size-4" />
                  </p>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-600">Our services will be listed here shortly.</p>
        )}
      </Section>

      <Section background="navy" spacing="tight">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl text-white sm:text-3xl">Not sure what you need?</h2>
            <p className="mt-3 text-navy-100">
              Give us a call or send a message and we will talk it through with you.
            </p>
          </div>
          <ButtonLink href="/contact" size="large" variant="accent">
            Get in touch
          </ButtonLink>
        </div>
      </Section>
    </>
  )
}
