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

  return (
    <footer className="bg-navy-900 text-navy-100">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          <div className="lg:col-span-1">
            <Logo
              logo={settings.logoLight || settings.logo}
              companyName={business.companyName}
              tone="light"
            />
            {business.tagline ? (
              <p className="mt-2 text-sm text-navy-200">{business.tagline}</p>
            ) : null}

            {socials.length ? (
              <ul className="mt-5 flex gap-3">
                {socials.map(([key, href]) => (
                  <li key={key}>
                    <a
                      href={href}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="inline-block rounded-lg border border-navy-700 px-3 py-1.5 text-xs font-medium hover:border-navy-400 hover:text-white"
                    >
                      {SOCIAL_LABELS[key] ?? key}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {settings.footerColumns?.map((column) => (
            <nav key={column.id ?? column.title} aria-label={column.title}>
              <h2 className="text-sm font-semibold tracking-wider text-white uppercase">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {column.links?.map((link) => (
                  <li key={link.id ?? link.href}>
                    <Link href={link.href} className="text-navy-200 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h2 className="text-sm font-semibold tracking-wider text-white uppercase">
              Get in touch
            </h2>
            <ul className="mt-4 space-y-3 text-sm">
              {business.telephone ? (
                <li className="flex gap-3">
                  <Icon name="phone" className="mt-0.5 size-4 shrink-0 text-accent-400" />
                  <a href={telHref(business.telephone)} className="hover:text-white">
                    {business.telephone}
                  </a>
                </li>
              ) : null}
              {business.email ? (
                <li className="flex gap-3">
                  <Icon name="mail" className="mt-0.5 size-4 shrink-0 text-accent-400" />
                  <a href={`mailto:${business.email}`} className="break-all hover:text-white">
                    {business.email}
                  </a>
                </li>
              ) : null}
              {addressLines.length ? (
                <li className="flex gap-3">
                  <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-accent-400" />
                  <a href={mapLink(business)} rel="noopener noreferrer" target="_blank">
                    <address className="not-italic">
                      {addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                  </a>
                </li>
              ) : null}
              {business.openingHours?.length ? (
                <li className="flex gap-3">
                  <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-accent-400" />
                  <span>
                    {business.openingHours.map((row) => (
                      <span key={row.id ?? row.days} className="block">
                        {row.days}: {row.hours}
                      </span>
                    ))}
                  </span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 py-6">
          {/* Redress and Client Money Protection membership are a legal
              disclosure requirement for letting agents in England. */}
          {business.redressScheme || business.clientMoneyProtection ? (
            <p className="mb-4 text-xs leading-relaxed text-navy-300">
              {[business.redressScheme, business.clientMoneyProtection, business.depositScheme]
                .filter(Boolean)
                .join(' · ')}
            </p>
          ) : null}

          {business.footerNote ? (
            <p className="mb-4 text-xs leading-relaxed text-navy-300">{business.footerNote}</p>
          ) : null}

          <div className="flex flex-col gap-4 text-xs text-navy-300 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {business.registeredName || business.companyName}
              {business.companyNumber ? ` · Company no. ${business.companyNumber}` : ''}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
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
