import type { Metadata, Viewport } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import React from 'react'

import { Analytics } from '@/components/layout/Analytics'
import { CookieConsent } from '@/components/layout/CookieConsent'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SkipLink } from '@/components/layout/SkipLink'
import { JsonLd } from '@/components/seo/JsonLd'
import { analytics, env } from '@/lib/env'
import { realEstateAgentSchema } from '@/lib/structured-data'
import { getBusinessDetails, getSiteSettings } from '@/lib/site'

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

export const viewport: Viewport = {
  themeColor: '#003d7e',
  colorScheme: 'light',
}

export async function generateMetadata(): Promise<Metadata> {
  const [business, settings] = await Promise.all([getBusinessDetails(), getSiteSettings()])

  return {
    metadataBase: new URL(env.siteUrl),
    title: {
      default: settings.defaultSeo?.titleSuffix || business.companyName,
      template: `%s | ${settings.defaultSeo?.titleSuffix || business.companyName}`,
    },
    description: settings.defaultSeo?.description || business.tagline || undefined,
    applicationName: business.companyName,
    formatDetection: { telephone: true, address: false, email: false },
  }
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const business = await getBusinessDetails()
  const analyticsEnabled = Boolean(analytics.provider && analytics.id)

  return (
    <html lang="en-GB" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />

        <JsonLd data={realEstateAgentSchema(business)} />

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
