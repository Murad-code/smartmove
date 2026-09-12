/**
 * Central place to read environment variables.
 *
 * Reading `process.env` directly scatters string literals and silent
 * `undefined`s through the codebase, so everything goes through here. Values
 * that the app genuinely cannot run without are asserted at import time on the
 * server; optional features degrade rather than throw.
 */

const isProduction = process.env.NODE_ENV === 'production'
const isTest = process.env.NODE_ENV === 'test'

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Builds and tests run without a live database or secret, so only a real
    // production server should hard-fail.
    if (!isProduction || process.env.NEXT_PHASE === 'phase-production-build') return ''
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

/**
 * Public origin of the site, no trailing slash.
 *
 * `NEXT_PUBLIC_SITE_URL` is inlined by Next at build time, which is what the
 * browser bundle needs. Emails and password-reset links run on the server and
 * must not use that inlined value: a production image built on a laptop would
 * otherwise point staff at localhost. `SITE_URL` is read at runtime and is
 * what Compose should set on the VPS.
 */
function siteUrl(): string {
  const raw = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

export const env = {
  isProduction,
  isTest,

  /**
   * Blocks all crawlers and adds `noindex` to every page. Set on preview
   * deployments so a staging copy never competes with the real site in search
   * or exposes demo content to indexing.
   */
  noindex: process.env.SITE_NOINDEX === 'true',

  /**
   * Optional. Adds the third-party demo listings and the home page
   * photography taken from them. Off (the default) is an empty site besides
   * the starter pages. Keep SITE_NOINDEX=true beside it.
   */
  seedDemo: process.env.SEED_DEMO === 'true',

  databaseUrl: required('DATABASE_URL', process.env.DATABASE_URL),
  payloadSecret: required('PAYLOAD_SECRET', process.env.PAYLOAD_SECRET),
  get siteUrl() {
    return siteUrl()
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER || 'console') as 'console' | 'resend',
    resendApiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'Smart Move Website <onboarding@resend.dev>',
    to: (process.env.EMAIL_TO || '')
      .split(',')
      .map((address) => address.trim())
      .filter(Boolean),
  },

  turnstile: {
    siteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
    secretKey: process.env.TURNSTILE_SECRET_KEY || '',
    get enabled() {
      return Boolean(this.siteKey && this.secretKey)
    },
  },
}

/** Analytics config is read on the client too, so it cannot use `env` above. */
export const analytics = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '',
  id: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  plausibleHost: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io',
}
