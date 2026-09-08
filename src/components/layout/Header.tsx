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
    <header className="header-shell sticky top-0 z-40 border-b border-ink-200 backdrop-blur-sm">
      {/* Utility strip. Hidden on small screens, where the call button in the
          mobile menu does the same job with less clutter. */}
      <div className="header-strip hidden border-b border-ink-100 bg-navy-900 text-navy-100 lg:grid">
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
        <div className="header-bar flex items-center justify-between gap-2 sm:gap-4">
          <div className="header-logo min-w-0">
            <Logo logo={settings.logo} companyName={business.companyName} priority />
          </div>

          <nav aria-label="Main" className="hidden lg:flex lg:items-center">
            <NavLinks links={links} />
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {phone && phoneHref ? (
              // Square and the same size as the menu button beside it. Two
              // controls of matching weight read as a pair; the old padded
              // link was a different shape and looked accidental next to it.
              <a
                href={phoneHref}
                className="grid size-11 place-items-center rounded-lg text-navy-800 transition-colors hover:bg-navy-50 active:bg-navy-100 lg:hidden"
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
