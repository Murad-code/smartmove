import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import React from 'react'

import { Analytics } from '@/components/layout/Analytics'
import { BackToTop } from '@/components/layout/BackToTop'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { Motion } from '@/components/layout/Motion'
import { PointerEffects } from '@/components/layout/PointerEffects'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { SkipLink } from '@/components/layout/SkipLink'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { JsonLd } from '@/components/seo/JsonLd'
import { analytics, env } from '@/lib/env'
import { toImage } from '@/lib/properties/mappers'
import { getBusinessDetails, getSiteSettings } from '@/lib/site'
import { realEstateAgentSchema } from '@/lib/structured-data'

import '@/styles/globals.css'

// Self-hosted by next/font, so there is no render-blocking request to Google
// and no third-party font cookie.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700'],
  variable: '--font-serif',
})

/**
 * Every page reads content from the CMS, so nothing is prerendered at build
 * time. That keeps the Docker build independent of the database and, more
 * importantly, means an edit in the admin panel is live the moment it is
 * saved rather than after a cache window. Postgres runs alongside the app and
 * a page costs a handful of indexed queries.
 *
 * If traffic ever justifies it, the route to caching is Next's ISR plus
 * `revalidatePath` in Payload `afterChange` hooks. See docs/architecture.md.
 */
export const dynamic = 'force-dynamic'

/**
 * Arms the motion system before the first paint.
 *
 * Everything that starts hidden and is revealed on scroll is gated on
 * `data-motion`, so that the page renders complete when scripting is
 * unavailable and when the visitor has asked for less movement. Setting the
 * flag from an effect instead would paint the content, then hide it, then
 * animate it back in. See docs/motion.md.
 */
const ARM_MOTION = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.dataset.motion='on'}catch(e){}`

export const viewport: Viewport = {
  themeColor: '#003d7e',
  colorScheme: 'light',
}

export async function generateMetadata(): Promise<Metadata> {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])

  // The client can replace this in Website Settings → Branding.
  const favicon = toImage(settings.favicon)

  return {
    metadataBase: new URL(env.siteUrl),
    icons: {
      icon: favicon ? [{ url: favicon.url }] : [{ url: '/brand-icon' }],
    },
    title: {
      default: settings.defaultSeo?.titleSuffix || business.companyName,
      template: `%s | ${settings.defaultSeo?.titleSuffix || business.companyName}`,
    },
    description: settings.defaultSeo?.description || business.tagline || undefined,
    applicationName: business.companyName,
    formatDetection: { telephone: true, address: false, email: false },
    // Belt and braces alongside robots.txt: a preview deployment sends the
    // header too, so a crawler that ignores robots.txt still sees noindex.
    ...(env.noindex ? { robots: { index: false, follow: false } } : {}),
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])
  const analyticsEnabled = Boolean(analytics.provider && analytics.id)

  return (
    // `data-scroll-behavior` is what makes Next suspend the `scroll-behavior:
    // smooth` in globals.css for the duration of a route change. Without it,
    // Next 16 leaves the smooth rule in place, its scroll reset is swallowed,
    // and the new page opens at the previous page's scroll offset.
    <html
      lang="en-GB"
      data-scroll-behavior="smooth"
      // The `ARM_MOTION` script below sets `data-motion` on this element
      // before React hydrates, which React would otherwise report as a
      // mismatch. It is one attribute added on purpose, so it is suppressed
      // here rather than moved somewhere that would paint first.
      suppressHydrationWarning
      className={`${inter.variable} ${sourceSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col">
        <script dangerouslySetInnerHTML={{ __html: ARM_MOTION }} />

        {/* What the back-to-top link anchors to. Anchoring to `main` instead
            lands a little way down, because the header sits above it in
            normal flow. */}
        <div id="top" />

        <SkipLink />
        <ScrollProgress />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />

        {/* The whole client-side motion layer: smoothed scrolling, one
            IntersectionObserver for reveals and counters, and the decorative
            pointer effects. Nothing else on the site needs `'use client'` for
            any of it. */}
        <SmoothScroll />
        <Motion />
        <PointerEffects />

        <JsonLd data={realEstateAgentSchema(business, settings)} />

        {analyticsEnabled ? (
          <>
            <CookieConsent />
            <Analytics
              provider={analytics.provider}
              id={analytics.id}
              plausibleHost={analytics.plausibleHost}
            />
          </>
        ) : null}
      </body>
    </html>
  )
}
