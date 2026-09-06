import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { GeneralEnquiryForm } from '@/components/forms/GeneralEnquiryForm'
import { LandlordEnquiryForm } from '@/components/forms/LandlordEnquiryForm'
import { RequirementsForm } from '@/components/forms/RequirementsForm'
import { PropertyGrid } from '@/components/property/PropertyCard'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { RichText } from '@/components/ui/RichText'
import { Section, SectionHeading } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import { env } from '@/lib/env'
import { findFeaturedProperties } from '@/lib/properties'
import { toImage } from '@/lib/properties/mappers'
import { formatAddress, getBusinessDetails, mapLink, telHref } from '@/lib/site'
import type { Page } from '@/payload-types'

type Block = NonNullable<Page['layout']>[number]

/**
 * Renders CMS page sections.
 *
 * Every branch is keyed off `blockType`, which TypeScript narrows for us, so a
 * new block added to `src/blocks` will fail to compile here until it is given
 * a renderer.
 */
export function RenderBlocks({ blocks }: { blocks: Block[] | null | undefined }) {
  if (!blocks?.length) return null

  return (
    <>
      {blocks.map((block, index) => (
        <BlockRenderer key={block.id ?? `${block.blockType}-${index}`} block={block} />
      ))}
    </>
  )
}

/** Split out so blocks that need to hit the database can be async. */
async function BlockRenderer({ block }: { block: Block }): Promise<React.ReactNode> {
  switch (block.blockType) {
    case 'text':
      return (
        <Section background={block.background === 'grey' ? 'grey' : 'white'}>
          {block.heading ? (
            <SectionHeading heading={block.heading} intro={block.intro} />
          ) : null}
          <RichText data={block.body} className={cn(block.heading && 'mt-8')} />
        </Section>
      )

    case 'featureList': {
      const light = block.background === 'navy'
      return (
        <Section
          background={
            block.background === 'navy' ? 'navy' : block.background === 'grey' ? 'grey' : 'white'
          }
        >
          {block.heading ? (
            <SectionHeading
              heading={block.heading}
              intro={block.intro}
              tone={light ? 'light' : 'dark'}
            />
          ) : null}
          <ul
            className={cn(
              'mt-10 grid gap-6 sm:grid-cols-2',
              block.columns === '4' && 'lg:grid-cols-4',
              block.columns === '2' && 'lg:grid-cols-2',
              (!block.columns || block.columns === '3') && 'lg:grid-cols-3',
            )}
          >
            {block.items?.map((item) => (
              <li
                key={item.id ?? item.title}
                className={cn(
                  'rounded-card border p-6',
                  light ? 'border-navy-700 bg-navy-800' : 'border-ink-200 bg-white shadow-card',
                )}
              >
                <div className="flex gap-3">
                  <Icon
                    name="check"
                    className={cn('mt-1 size-5 shrink-0', light ? 'text-accent-400' : 'text-accent-600')}
                  />
                  <div>
                    <h3 className={cn('text-lg', light && 'text-white')}>{item.title}</h3>
                    {item.description ? (
                      <p className={cn('mt-2 text-sm', light ? 'text-navy-200' : 'text-ink-600')}>
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )
    }

    case 'steps':
      return (
        <Section background="grey">
          {block.heading ? <SectionHeading heading={block.heading} intro={block.intro} /> : null}
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {block.steps?.map((step, index) => (
              <li key={step.id ?? step.title} className="rounded-card bg-white p-6 shadow-card">
                <span
                  aria-hidden="true"
                  className="grid size-9 place-items-center rounded-full bg-navy-700 font-display text-sm font-bold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg">{step.title}</h3>
                {step.description ? (
                  <p className="mt-2 text-sm text-ink-600">{step.description}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </Section>
      )

    case 'imageText': {
      const image = toImage(block.image)
      return (
        <Section>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            {image ? (
              <div
                className={cn(
                  'relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100',
                  block.imagePosition === 'right' && 'lg:order-2',
                )}
              >
                <Image
                  src={image.wideUrl ?? image.url}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div>
              <h2 className="text-3xl sm:text-4xl">{block.heading}</h2>
              <RichText data={block.body} className="mt-5" />
              {block.link?.label && block.link?.href ? (
                <ButtonLink href={block.link.href} className="mt-7">
                  {block.link.label}
                  <Icon name="arrow-right" className="size-4" />
                </ButtonLink>
              ) : null}
            </div>
          </div>
        </Section>
      )
    }

    case 'callToAction':
      return (
        <Section background="navy" spacing="tight">
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl text-white sm:text-3xl">{block.heading}</h2>
              {block.text ? <p className="mt-3 text-navy-100">{block.text}</p> : null}
            </div>
            {block.buttons?.length ? (
              <div className="flex flex-wrap gap-3">
                {block.buttons.map((button, index) => (
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
      )

    case 'propertyShowcase': {
      const properties = await findFeaturedProperties(block.limit ?? 3)
      if (!properties.length) return null
      return (
        <Section background="grey">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading heading={block.heading || 'Available now'} intro={block.intro} />
            <ButtonLink href="/properties" variant="secondary">
              See all properties
            </ButtonLink>
          </div>
          <div className="mt-10">
            <PropertyGrid properties={properties} priorityCount={0} />
          </div>
        </Section>
      )
    }

    case 'faq':
      return (
        <Section>
          {block.heading ? <SectionHeading heading={block.heading} intro={block.intro} /> : null}
          <div className="mt-8 max-w-3xl divide-y divide-ink-200 border-y border-ink-200">
            {block.items?.map((item) => (
              <details key={item.id ?? item.question} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-navy-900">
                  {item.question}
                  <Icon
                    name="chevron-right"
                    className="size-5 shrink-0 text-navy-500 transition-transform group-open:rotate-90"
                  />
                </summary>
                <RichText data={item.answer} className="mt-3" />
              </details>
            ))}
          </div>
        </Section>
      )

    case 'contactDetails': {
      const business = await getBusinessDetails()
      const addressLines = formatAddress(business)
      return (
        <Section background="grey">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-2xl">{block.heading || 'Visit or call us'}</h2>
            </div>
            <dl className="grid gap-8 sm:grid-cols-2 lg:col-span-2">
              {business.telephone ? (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                    <Icon name="phone" className="size-4 text-navy-600" /> Telephone
                  </dt>
                  <dd className="mt-1.5 text-lg">
                    <a href={telHref(business.telephone)} className="text-navy-800 hover:underline">
                      {business.telephone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {business.email ? (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                    <Icon name="mail" className="size-4 text-navy-600" /> Email
                  </dt>
                  <dd className="mt-1.5 break-all text-lg">
                    <a href={`mailto:${business.email}`} className="text-navy-800 hover:underline">
                      {business.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {addressLines.length ? (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                    <Icon name="pin" className="size-4 text-navy-600" /> Office
                  </dt>
                  <dd className="mt-1.5">
                    <address className="not-italic text-ink-700">
                      {addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                    {block.showMap ? (
                      <Link
                        href={mapLink(business)}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 underline"
                      >
                        Get directions
                        <Icon name="arrow-right" className="size-4" />
                      </Link>
                    ) : null}
                  </dd>
                </div>
              ) : null}
              {business.openingHours?.length ? (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                    <Icon name="clock" className="size-4 text-navy-600" /> Opening hours
                  </dt>
                  <dd className="mt-1.5 text-ink-700">
                    {business.openingHours.map((row) => (
                      <span key={row.id ?? row.days} className="block">
                        {row.days}: {row.hours}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </Section>
      )
    }

    case 'form': {
      const siteKey = env.turnstile.enabled ? env.turnstile.siteKey : undefined
      return (
        <Section id="enquiry">
          <Container size="narrow" className="px-0">
            {block.heading ? (
              <SectionHeading heading={block.heading} intro={block.intro} />
            ) : null}
            <div className={cn(block.heading && 'mt-8')}>
              {block.formType === 'landlord' ? (
                <LandlordEnquiryForm turnstileSiteKey={siteKey} />
              ) : block.formType === 'requirements' ? (
                <RequirementsForm turnstileSiteKey={siteKey} />
              ) : (
                <GeneralEnquiryForm turnstileSiteKey={siteKey} />
              )}
            </div>
          </Container>
        </Section>
      )
    }

    default:
      return null
  }
}
