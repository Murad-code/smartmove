import Image from 'next/image'
import type { Metadata } from 'next'
import React from 'react'

import { HeroCarousel, type HeroSlide } from '@/components/layout/HeroCarousel'
import { LivePreview } from '@/components/layout/LivePreview'
import { PropertyRail } from '@/components/property/PropertyCard'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section, SectionHeading } from '@/components/ui/Section'
import { StatGrid } from '@/components/ui/StatGrid'
import { TestimonialGrid } from '@/components/ui/Testimonial'
import { Marquee } from '@/components/ui/Marquee'
import { findServices } from '@/lib/pages'
import { findFeaturedProperties } from '@/lib/properties'
import { toImage } from '@/lib/properties/mappers'
import { previewRequested } from '@/lib/preview'
import { buildMetadata } from '@/lib/seo'
import { getBusinessDetails, getHomePage } from '@/lib/site'

export async function generateMetadata(): Promise<Metadata> {
  const [home, business] = await Promise.all([getHomePage(), getBusinessDetails()])
  // The first slide is what a visitor and a link preview both land on.
  const lead = home.hero?.slides?.[0]

  return buildMetadata({
    title: business.tagline || lead?.heading,
    description: lead?.subheading,
    path: '/',
    image: lead?.image,
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
  // The strip under the hero says what the business does, in the client's own
  // words. Nothing about accreditations or fees goes in here: it is a claims
  // strip in a prominent place and none of that has been confirmed.
  const services = await findServices()

  const slides: HeroSlide[] = (home.hero?.slides ?? []).map((slide, position) => {
    const image = toImage(slide.image)
    return {
      id: slide.id ?? String(position),
      heading: slide.heading,
      subheading: slide.subheading,
      imageUrl: image?.heroUrl ?? image?.wideUrl ?? image?.url ?? null,
      primaryCta: slide.primaryCta ?? null,
      secondaryCta: slide.secondaryCta ?? null,
    }
  })

  // A database that has been migrated but not re-seeded has no slides yet, and
  // a home page with no banner and no h1 is worse than a plain one. The old
  // single-field hero fell back the same way.
  const heroSlides: HeroSlide[] = slides.length
    ? slides
    : [{ id: 'fallback', heading: business.tagline || 'Letting agents in Scunthorpe' }]

  const introImage = toImage(home.intro?.image)
  const landlordImage = toImage(home.landlords?.image)
  const tenantImage = toImage(home.tenants?.image)
  const testimonials = home.testimonials?.items ?? []

  return (
    <>
      <LivePreview enabled={preview} />

      {/* Hero -------------------------------------------------------------- */}
      <HeroCarousel
        slides={heroSlides}
        autoplay={home.hero?.autoplay !== false}
        footer={
          home.highlights?.length ? (
            <ul className="mt-12 grid gap-4 sm:grid-cols-3">
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
          ) : null
        }
      />

      <Marquee items={services.map((service) => service.title)} />

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
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100 shadow-raised">
                <Image
                  src={introImage.wideUrl ?? introImage.url}
                  alt={introImage.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="ken-burns object-cover"
                />
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

      {/* Figures ----------------------------------------------------------- */}
      {home.stats?.length ? (
        <Section background="navy" spacing="tight" animate={false}>
          <StatGrid stats={home.stats} />
        </Section>
      ) : null}

      {/* Featured properties ----------------------------------------------- */}
      <Section background="grey" animate={false}>
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
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
            <PropertyRail properties={properties} />
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100 shadow-raised">
                <Image
                  src={landlordImage.wideUrl ?? landlordImage.url}
                  alt={landlordImage.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="ken-burns object-cover"
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
                <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100 shadow-raised">
                  <Image
                    src={tenantImage.wideUrl ?? tenantImage.url}
                    alt={tenantImage.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="ken-burns object-cover"
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
        <Section animate={false}>
          <div className="reveal">
            <SectionHeading
              heading={home.whyUs.heading || 'Why people choose Smart Move'}
              intro={home.whyUs.intro}
              align="center"
            />
          </div>
          <ul className="reveal-group mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {home.whyUs.reasons.map((reason) => (
              <li
                key={reason.id ?? reason.title}
                className="lift-card rounded-card border border-ink-200 bg-white p-6 shadow-card hover:border-transparent hover:shadow-raised"
              >
                <span className="grid size-11 place-items-center rounded-lg bg-navy-50 text-navy-700">
                  <Icon name={reason.icon ?? 'shield'} />
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

      {/* What people say ---------------------------------------------------- */}
      {testimonials.length ? (
        <Section background="grey" animate={false}>
          <div className="reveal">
            <SectionHeading
              heading={home.testimonials?.heading || 'What people say about us'}
              intro={home.testimonials?.intro}
              align="center"
            />
          </div>
          <div className="mt-12">
            <TestimonialGrid items={testimonials} />
          </div>
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
