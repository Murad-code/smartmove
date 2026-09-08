import { afterEach, describe, expect, it } from 'vitest'

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
