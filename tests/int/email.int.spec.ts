import { afterEach, describe, expect, it } from 'vitest'

import { E2E_EMAIL_HEADER_VALUE, shouldUseConsoleEmail } from '@/lib/email/e2e'
import { adminEnquiryUrl } from '@/lib/email/templates'

describe('enquiry notification links', () => {
  const previousSiteUrl = process.env.SITE_URL
  const previousPublicUrl = process.env.NEXT_PUBLIC_SITE_URL

  afterEach(() => {
    if (previousSiteUrl === undefined) delete process.env.SITE_URL
    else process.env.SITE_URL = previousSiteUrl
    if (previousPublicUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = previousPublicUrl
  })

  it('uses SITE_URL at runtime so production emails are not stuck on localhost', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
    process.env.SITE_URL = 'https://smartmove4u.muradsprojects.co.uk'

    expect(adminEnquiryUrl(42)).toBe(
      'https://smartmove4u.muradsprojects.co.uk/admin/collections/enquiries/42',
    )
  })
})

describe('e2e email routing', () => {
  it('writes to the console on a development e2e request', () => {
    expect(shouldUseConsoleEmail(false, E2E_EMAIL_HEADER_VALUE)).toBe(true)
  })

  it('never lets the e2e header silence mail in production', () => {
    expect(shouldUseConsoleEmail(true, E2E_EMAIL_HEADER_VALUE)).toBe(false)
  })

  it('leaves a normal development request on the configured provider', () => {
    expect(shouldUseConsoleEmail(false, null)).toBe(false)
  })
})
