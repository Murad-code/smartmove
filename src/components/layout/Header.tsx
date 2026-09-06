import React from 'react'

import { Container } from '@/components/ui/Container'
import { ButtonLink } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { getBusinessDetails, getSiteSettings, telHref } from '@/lib/site'

import { Logo } from './Logo'
import { MobileNav, type NavLink } from './MobileNav'
import { NavLinks } from './NavLinks'

/** Used until the owner sets up their own menu in Website Settings. */
const FALLBACK_NAV: NavLink[] = [
  { label: 'Properties', href: '/properties' },
  { label: 'Landlords', href: '/landlords' },
  { label: 'Tenants', href: '/tenants' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export async function Header() {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])

  const links: NavLink[] = settings.mainNav?.length
    ? settings.mainNav.map((item) => ({ label: item.label, href: item.href }))
    : FALLBACK_NAV

  const cta =
    settings.headerCta?.label && settings.headerCta?.href
      ? { label: settings.headerCta.label, href: settings.headerCta.href }
      : { label: 'Book a valuation', href: '/landlords#enquiry' }

  const phone = business.telephone
  const phoneHref = phone ? telHref(phone) : undefined

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/95 backdrop-blur-sm">
      {/* Utility strip. Hidden on small screens, where the call button in the
          mobile menu does the same job with less clutter. */}
      <div className="hidden border-b border-ink-100 bg-navy-900 text-navy-100 lg:block">
        <Container>
          <div className="flex items-center justify-between py-2 text-sm">
            <p>{business.tagline || 'Independent letting agents in Scunthorpe'}</p>
            <div className="flex items-center gap-6">
              {phone && phoneHref ? (
                <a href={phoneHref} className="inline-flex items-center gap-2 hover:text-white">
                  <Icon name="phone" className="size-4" />
                  {phone}
                </a>
              ) : null}
              {business.email ? (
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex items-center gap-2 hover:text-white"
                >
                  <Icon name="mail" className="size-4" />
                  {business.email}
                </a>
              ) : null}
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex h-18 items-center justify-between gap-2 py-3 sm:gap-4">
          <div className="min-w-0">
            <Logo logo={settings.logo} companyName={business.companyName} />
          </div>

          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks links={links} />
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {phone && phoneHref ? (
              <a
                href={phoneHref}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-semibold text-navy-800 hover:bg-navy-50 lg:hidden"
              >
                <Icon name="phone" className="size-5" />
                <span className="sr-only">Call {phone}</span>
              </a>
            ) : null}

            {/* Wrapped rather than given a `hidden` class: the button's own
                `inline-flex` is in the same CSS layer and would win. */}
            <div className="hidden lg:block">
              <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
            </div>

            <MobileNav links={links} telephone={phone} telHref={phoneHref} cta={cta} />
          </div>
        </div>
      </Container>
    </header>
  )
}
