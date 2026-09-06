import { describe, expect, it } from 'vitest'

import {
  generalEnquirySchema,
  landlordEnquirySchema,
  propertyEnquirySchema,
  requirementsSchema,
  toFieldErrors,
} from '@/lib/forms/schemas'

/** The base fields every form shares, valid unless a test overrides them. */
const validBase = {
  name: 'Jane Fletcher',
  email: 'jane@example.com',
  telephone: '01724 856260',
  message: 'I would like to arrange a viewing next week if possible.',
  consent: 'yes',
}

describe('general enquiry validation', () => {
  it('accepts a complete submission', () => {
    const result = generalEnquirySchema.safeParse({
      ...validBase,
      enquiryTopic: 'Renting a property',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a submission with no telephone number', () => {
    const result = generalEnquirySchema.safeParse({ ...validBase, telephone: '' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email address', () => {
    const result = generalEnquirySchema.safeParse({ ...validBase, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(toFieldErrors(result.error).email).toBe('Please enter a valid email address')
    }
  })

  it('rejects a message that is too short to act on', () => {
    const result = generalEnquirySchema.safeParse({ ...validBase, message: 'hi' })
    expect(result.success).toBe(false)
  })

  it('requires the consent box to be ticked', () => {
    const { consent: _consent, ...withoutConsent } = validBase
    const result = generalEnquirySchema.safeParse(withoutConsent)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(toFieldErrors(result.error).consent).toContain('happy for us to contact you')
    }
  })

  it('trims surrounding whitespace', () => {
    const result = generalEnquirySchema.safeParse({ ...validBase, name: '  Jane Fletcher  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.name).toBe('Jane Fletcher')
  })

  it('rejects a telephone number containing letters', () => {
    const result = generalEnquirySchema.safeParse({ ...validBase, telephone: 'call me' })
    expect(result.success).toBe(false)
  })

  it('accepts UK numbers written in different styles', () => {
    for (const telephone of ['01724 856260', '+44 1724 856260', '(01724) 856260', '07700900123']) {
      expect(generalEnquirySchema.safeParse({ ...validBase, telephone }).success).toBe(true)
    }
  })
})

describe('property enquiry validation', () => {
  it('requires the property it relates to', () => {
    const result = propertyEnquirySchema.safeParse(validBase)
    expect(result.success).toBe(false)
    if (!result.success) expect(toFieldErrors(result.error).propertyId).toBeDefined()
  })

  it('requires a telephone number so a viewing can be arranged', () => {
    const result = propertyEnquirySchema.safeParse({
      ...validBase,
      propertyId: '12',
      telephone: '',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a complete enquiry', () => {
    const result = propertyEnquirySchema.safeParse({
      ...validBase,
      propertyId: '12',
      preferredViewing: 'Weekday afternoons',
    })
    expect(result.success).toBe(true)
  })
})

describe('landlord enquiry validation', () => {
  it('accepts a complete enquiry', () => {
    const result = landlordEnquirySchema.safeParse({
      ...validBase,
      postcode: 'DN15 7JW',
      serviceInterest: 'Full property management',
    })
    expect(result.success).toBe(true)
  })

  it('requires a telephone number for the callback', () => {
    const result = landlordEnquirySchema.safeParse({ ...validBase, telephone: '' })
    expect(result.success).toBe(false)
  })
})

describe('requirements validation', () => {
  it('accepts a registration with no message', () => {
    const { message: _message, ...withoutMessage } = validBase
    const result = requirementsSchema.safeParse({
      ...withoutMessage,
      preferredArea: 'Ashby',
      minBedrooms: '2',
      maxRent: '700',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.minBedrooms).toBe(2)
      expect(result.data.maxRent).toBe(700)
    }
  })

  it('rejects a negative rent ceiling', () => {
    const result = requirementsSchema.safeParse({ ...validBase, maxRent: '-100' })
    expect(result.success).toBe(false)
  })
})

describe('honeypot field', () => {
  it('rejects a submission where the hidden field was filled in', () => {
    const result = generalEnquirySchema.safeParse({
      ...validBase,
      companyWebsite: 'http://spam.example',
    })
    expect(result.success).toBe(false)
  })
})
