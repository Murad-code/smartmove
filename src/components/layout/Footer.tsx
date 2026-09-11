import Link from 'next/link'
import React from 'react'

import { Logo } from '@/components/layout/Logo'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { formatAddress, getBusinessDetails, getSiteSettings, mapLink, telHref } from '@/lib/site'

const FALLBACK_LEGAL = [
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Cookie policy', href: '/cookie-policy' },
  { label: 'Terms of use', href: '/terms' },
  { label: 'Tenant fees', href: '/tenant-fees' },
]

const SOCIAL_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  x: 'X',
  linkedin: 'LinkedIn',
}

export async function Footer() {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])

  const addressLines = formatAddress(business)
  const legalLinks = settings.legalLinks?.length ? settings.legalLinks : FALLBACK_LEGAL
  const socials = Object.entries(business.social ?? {}).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  )
  const disclosures = [
    business.redressScheme,
    business.clientMoneyProtection,
    business.depositScheme,
  ].filter(Boolean)

  return (
    <footer className="bg-navy-900 text-navy-100">
      <Container>
        <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-6">
          <div className="min-w-0">
            <Logo
              logo={settings.logoLight || settings.logo}
              companyName={business.companyName}
              tone="light"
            />
            {business.tagline ? (
              <p className="mt-1.5 text-sm text-navy-200">{business.tagline}</p>
            ) : null}
          </div>

          {socials.length ? (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {socials.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="text-navy-200 hover:text-white"
                  >
                    {SOCIAL_LABELS[key] ?? key}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-8 border-t border-navy-800 py-8 lg:grid-cols-12 lg:gap-x-10 lg:py-9">
          {settings.footerColumns?.map((column, index, columns) => {
            const oddLastOnMobile = columns.length % 2 === 1 && index === columns.length - 1

            return (
              <nav
                key={column.id ?? column.title}
                aria-label={column.title}
                className={oddLastOnMobile ? 'col-span-2 lg:col-span-3' : 'lg:col-span-3'}
              >
                <FooterHeading>{column.title}</FooterHeading>
                <ul className="mt-3 space-y-2 text-sm">
                  {column.links?.map((link) => (
                    <li key={link.id ?? link.href}>
                      <Link href={link.href} className="text-navy-200 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          })}

          <div className={contactSpanClass(settings.footerColumns?.length ?? 0)}>
            <FooterHeading>Get in touch</FooterHeading>
            <div className="mt-3 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
              <ul className="space-y-2.5">
                {business.telephone ? (
                  <li className="flex gap-2.5">
                    <Icon name="phone" className="mt-0.5 size-4 shrink-0 text-navy-300" />
                    <a href={telHref(business.telephone)} className="text-navy-200 hover:text-white">
                      {business.telephone}
                    </a>
                  </li>
                ) : null}
                {business.email ? (
                  <li className="flex min-w-0 gap-2.5">
                    <Icon name="mail" className="mt-0.5 size-4 shrink-0 text-navy-300" />
                    <a
                      href={`mailto:${business.email}`}
                      className="wrap-break-word text-navy-200 hover:text-white"
                    >
                      {business.email}
                    </a>
                  </li>
                ) : null}
              </ul>
              <ul className="space-y-2.5">
                {addressLines.length ? (
                  <li className="flex gap-2.5">
                    <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-navy-300" />
                    <a
                      href={mapLink(business)}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="text-navy-200 hover:text-white"
                    >
                      <address className="not-italic">
                        {addressLines.map((line) => (
                          <span key={line} className="block leading-snug">
                            {line}
                          </span>
                        ))}
                      </address>
                    </a>
                  </li>
                ) : null}
                {business.openingHours?.length ? (
                  <li className="flex gap-2.5">
                    <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-navy-300" />
                    <span>
                      {business.openingHours.map((row) => (
                        <span key={row.id ?? row.days} className="block leading-snug">
                          <span className="text-navy-300">{row.days}</span>{' '}
                          <span className="text-navy-200">{row.hours}</span>
                        </span>
                      ))}
                    </span>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-navy-800 py-4">
          {/* Redress and Client Money Protection membership are a legal
              disclosure requirement for letting agents in England. */}
          {disclosures.length || business.footerNote ? (
            <div className="mb-2.5 space-y-1 text-xs leading-snug text-navy-300">
              {disclosures.length ? <p>{disclosures.join(' · ')}</p> : null}
              {business.footerNote ? <p>{business.footerNote}</p> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {business.registeredName || business.companyName}
              {business.companyNumber ? ` · Company no. ${business.companyNumber}` : ''}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  )
}

/** Same eyebrow treatment as section labels elsewhere: sans, not the display serif. */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-sans text-sm font-semibold tracking-wider text-accent-300 uppercase">
      {children}
    </h2>
  )
}

/**
 * Link columns take three of twelve. What remains goes to the contact block,
 * so two short lists do not leave a cramped stack sitting in an empty fourth
 * column.
 */
function contactSpanClass(columnCount: number): string {
  if (columnCount === 0) return 'col-span-2 lg:col-span-12'
  if (columnCount === 1) return 'col-span-2 lg:col-span-9'
  if (columnCount === 2) return 'col-span-2 lg:col-span-6'
  return 'col-span-2 lg:col-span-3'
}
