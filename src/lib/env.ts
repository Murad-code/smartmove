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

function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return raw.replace(/\/+$/, '')
}

export const env = {
  isProduction,
  isTest,

  databaseUrl: required('DATABASE_URL', process.env.DATABASE_URL),
  payloadSecret: required('PAYLOAD_SECRET', process.env.PAYLOAD_SECRET),
  siteUrl: siteUrl(),

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
} as const

/** Analytics config is read on the client too, so it cannot use `env` above. */
export const analytics = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || '',
  id: process.env.NEXT_PUBLIC_ANALYTICS_ID || '',
  plausibleHost: process.env.NEXT_PUBLIC_PLAUSIBLE_HOST || 'https://plausible.io',
}
