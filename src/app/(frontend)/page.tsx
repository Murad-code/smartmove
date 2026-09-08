import Image from 'next/image'
import type { Metadata } from 'next'
import React from 'react'

import { LivePreview } from '@/components/layout/LivePreview'
import { PropertyGrid } from '@/components/property/PropertyCard'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section, SectionHeading } from '@/components/ui/Section'
import { findFeaturedProperties } from '@/lib/properties'
import { toImage } from '@/lib/properties/mappers'
import { previewRequested } from '@/lib/preview'
import { buildMetadata } from '@/lib/seo'
import { getBusinessDetails, getHomePage } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const [home, business] = await Promise.all([getHomePage(), getBusinessDetails()])
  return buildMetadata({
    title: business.tagline || home.hero?.heading,
    description: home.hero?.subheading,
    path: '/',
    image: home.hero?.image,
  })
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const preview = previewRequested(await searchParams)
  const [home, business] = await Promise.all([getHomePage(), getBusinessDetails()])
  const properties = await findFeaturedProperties(home.featuredProperties?.limit ?? 3)

  const heroImage = toImage(home.hero?.image)
  const introImage = toImage(home.intro?.image)
  const landlordImage = toImage(home.landlords?.image)
  const tenantImage = toImage(home.tenants?.image)

  return (
    <>
      <LivePreview enabled={preview} />

      {/* Hero -------------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden bg-navy-900">
        {heroImage ? (
          <>
            <Image
              src={heroImage.heroUrl ?? heroImage.wideUrl ?? heroImage.url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {/* Dark wash so the heading keeps AA contrast whatever photo the
                owner uploads. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/75 to-navy-950/40"
            />
          </>
        ) : null}

        <Container className="relative py-20 sm:py-28 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl text-white sm:text-5xl lg:text-6xl">
              {home.hero?.heading ?? 'Letting agents in Scunthorpe'}
            </h1>
            {home.hero?.subheading ? (
              <p className="mt-6 text-lg text-navy-100 sm:text-xl">{home.hero.subheading}</p>
            ) : null}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {home.hero?.primaryCta?.label && home.hero.primaryCta.href ? (
                <ButtonLink href={home.hero.primaryCta.href} size="large" variant="accent">
                  {home.hero.primaryCta.label}
                  <Icon name="arrow-right" className="size-4" />
                </ButtonLink>
              ) : null}
              {home.hero?.secondaryCta?.label && home.hero.secondaryCta.href ? (
                <ButtonLink href={home.hero.secondaryCta.href} size="large" variant="inverse">
                  {home.hero.secondaryCta.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>

          {home.highlights?.length ? (
            <ul className="mt-14 grid gap-4 sm:grid-cols-3">
              {home.highlights.map((item) => (
                <li
                  key={item.id ?? item.title}
                  className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <p className="font-semibold text-white">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-navy-100">{item.description}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Container>
      </section>

      {/* Introduction ------------------------------------------------------ */}
      {home.intro?.heading || home.intro?.body ? (
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              {home.intro.heading ? (
                <h2 className="text-3xl sm:text-4xl">{home.intro.heading}</h2>
              ) : null}
              <RichText data={home.intro.body} className="mt-5" />
            </div>
            {introImage ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100">
                <Image
                  src={introImage.wideUrl ?? introImage.url}
                  alt={introImage.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Featured properties ----------------------------------------------- */}
      <Section background="grey">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            heading={home.featuredProperties?.heading || 'Available to rent now'}
            intro={home.featuredProperties?.intro}
          />
          <ButtonLink href="/properties" variant="secondary">
            See all properties
          </ButtonLink>
        </div>

        <div className="mt-10">
          {properties.length ? (
            <PropertyGrid properties={properties} />
          ) : (
            <div className="rounded-card border border-dashed border-ink-300 bg-white p-10 text-center">
              <Icon name="house" className="mx-auto size-10 text-ink-400" />
              <p className="mt-3 font-medium text-ink-800">
                We do not have any properties listed at the moment.
              </p>
              <p className="mt-1 text-sm text-ink-600">
                Tell us what you are looking for and we will get in touch as soon as something
                suitable comes up.
              </p>
              <ButtonLink href="/register-interest" className="mt-6">
                Register your requirements
              </ButtonLink>
            </div>
          )}
        </div>
      </Section>

      {/* Landlords --------------------------------------------------------- */}
      {home.landlords?.heading ? (
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {landlordImage ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100">
                <Image
                  src={landlordImage.wideUrl ?? landlordImage.url}
                  alt={landlordImage.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div>
              <p className="mb-3 text-sm font-semibold tracking-wider text-accent-700 uppercase">
                For landlords
              </p>
              <h2 className="text-3xl sm:text-4xl">{home.landlords.heading}</h2>
              {home.landlords.body ? (
                <p className="mt-4 text-lg text-ink-600">{home.landlords.body}</p>
              ) : null}
              {home.landlords.points?.length ? (
                <ul className="mt-6 space-y-3">
                  {home.landlords.points.map((point) => (
                    <li key={point.id ?? point.text} className="flex gap-3">
                      <Icon name="check" className="mt-1 size-5 shrink-0 text-accent-600" />
                      <span className="text-ink-700">{point.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {home.landlords.cta?.label && home.landlords.cta.href ? (
                <ButtonLink href={home.landlords.cta.href} className="mt-8">
                  {home.landlords.cta.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Tenants ----------------------------------------------------------- */}
      {home.tenants?.heading ? (
        <Section background="navy-soft">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="lg:order-2">
              {tenantImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100">
                  <Image
                    src={tenantImage.wideUrl ?? tenantImage.url}
                    alt={tenantImage.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : null}
            </div>
            <div className="lg:order-1">
              <p className="mb-3 text-sm font-semibold tracking-wider text-accent-700 uppercase">
                For tenants
              </p>
              <h2 className="text-3xl sm:text-4xl">{home.tenants.heading}</h2>
              {home.tenants.body ? (
                <p className="mt-4 text-lg text-ink-600">{home.tenants.body}</p>
              ) : null}
              {home.tenants.points?.length ? (
                <ul className="mt-6 space-y-3">
                  {home.tenants.points.map((point) => (
                    <li key={point.id ?? point.text} className="flex gap-3">
                      <Icon name="check" className="mt-1 size-5 shrink-0 text-accent-600" />
                      <span className="text-ink-700">{point.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {home.tenants.cta?.label && home.tenants.cta.href ? (
                <ButtonLink href={home.tenants.cta.href} className="mt-8">
                  {home.tenants.cta.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      {/* Why us ------------------------------------------------------------ */}
      {home.whyUs?.reasons?.length ? (
        <Section>
          <SectionHeading
            heading={home.whyUs.heading || 'Why people choose Smart Move'}
            intro={home.whyUs.intro}
            align="center"
          />
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.whyUs.reasons.map((reason) => (
              <li
                key={reason.id ?? reason.title}
                className="rounded-card border border-ink-200 bg-white p-6 shadow-card"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon name="shield" />
                </span>
                <h3 className="mt-4 text-lg">{reason.title}</h3>
                {reason.description ? (
                  <p className="mt-2 text-sm text-ink-600">{reason.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Closing call to action -------------------------------------------- */}
      {home.closingCta?.heading ? (
        <Section background="navy" spacing="tight">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl text-white sm:text-3xl">{home.closingCta.heading}</h2>
              {home.closingCta.text ? (
                <p className="mt-3 text-navy-100">{home.closingCta.text}</p>
              ) : null}
              {business.telephone ? (
                <p className="mt-4 text-navy-100">
                  Or call us on{' '}
                  <a
                    href={`tel:${business.telephone.replace(/[^\d+]/g, '')}`}
                    className="font-semibold text-white underline"
                  >
                    {business.telephone}
                  </a>
                </p>
              ) : null}
            </div>
            {home.closingCta.buttons?.length ? (
              <div className="flex flex-wrap gap-3">
                {home.closingCta.buttons.map((button, index) => (
                  <ButtonLink
                    key={button.id ?? button.href}
                    href={button.href}
                    size="large"
                    variant={index === 0 ? 'accent' : 'inverse'}
                  >
                    {button.label}
                  </ButtonLink>
                ))}
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}
    </>
  )
}
