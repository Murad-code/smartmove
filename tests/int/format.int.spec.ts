import { describe, expect, it } from 'vitest'

import { formatAvailability, formatDate, formatMoney, formatRent, pluralise } from '@/lib/format'
import { slugify } from '@/fields/slug'

describe('money', () => {
  it('formats whole pounds with no decimals', () => {
    expect(formatMoney(650)).toBe('£650')
    expect(formatMoney(1050)).toBe('£1,050')
  })

  it('adds the pcm suffix rents are quoted with', () => {
    expect(formatRent(725)).toBe('£725 pcm')
  })
})

describe('dates', () => {
  it('formats in the British style', () => {
    expect(formatDate('2026-03-01T00:00:00.000Z')).toBe('1 March 2026')
  })

  it('returns nothing for a missing or invalid date', () => {
    expect(formatDate(null)).toBeUndefined()
    expect(formatDate('rubbish')).toBeUndefined()
  })
})

describe('availability wording', () => {
  it('treats a blank date as available now, matching the CMS help text', () => {
    expect(formatAvailability(null)).toBe('Available now')
  })

  it('treats a past date as available now', () => {
    expect(formatAvailability('2020-01-01T00:00:00.000Z')).toBe('Available now')
  })

  it('names a future date', () => {
    const future = new Date(Date.now() + 30 * 86_400_000).toISOString()
    expect(formatAvailability(future)).toMatch(/^From /)
  })
})

describe('pluralising', () => {
  it('uses the singular for one', () => {
    expect(pluralise(1, 'bed')).toBe('1 bed')
  })

  it('uses the plural otherwise', () => {
    expect(pluralise(0, 'bed')).toBe('0 beds')
    expect(pluralise(3, 'bed')).toBe('3 beds')
  })
})

describe('slugs', () => {
  it('makes a URL-safe slug from a property title', () => {
    expect(slugify('3 Bedroom Semi-Detached House, Ashby')).toBe(
      '3-bedroom-semi-detached-house-ashby',
    )
  })

  it('spells out an ampersand', () => {
    expect(slugify('Terms & Conditions')).toBe('terms-and-conditions')
  })

  it('does not leave leading or trailing dashes', () => {
    expect(slugify('  Hello!  ')).toBe('hello')
  })
})
