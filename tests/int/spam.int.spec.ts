import { beforeEach, describe, expect, it } from 'vitest'

import { checkRateLimit, isHoneypotTripped, isTooFast, resetRateLimits } from '@/lib/forms/spam'

describe('honeypot detection', () => {
  it('passes when the hidden field is empty', () => {
    expect(isHoneypotTripped('')).toBe(false)
    expect(isHoneypotTripped(undefined)).toBe(false)
    expect(isHoneypotTripped('   ')).toBe(false)
  })

  it('trips when the hidden field has content', () => {
    expect(isHoneypotTripped('http://spam.example')).toBe(true)
  })
})

describe('submission timing', () => {
  it('rejects a form submitted immediately after rendering', () => {
    expect(isTooFast(String(Date.now()))).toBe(true)
  })

  it('accepts a form that took a person a few seconds', () => {
    expect(isTooFast(String(Date.now() - 5_000))).toBe(false)
  })

  it('accepts a missing or unparseable timestamp rather than blocking a real visitor', () => {
    expect(isTooFast(undefined)).toBe(false)
    expect(isTooFast('not-a-number')).toBe(false)
  })
})

describe('rate limiting', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('allows a handful of submissions', () => {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(checkRateLimit('general:203.0.113.1')).toBe(true)
    }
  })

  it('blocks once the cap is passed', () => {
    for (let attempt = 0; attempt < 5; attempt += 1) checkRateLimit('general:203.0.113.2')
    expect(checkRateLimit('general:203.0.113.2')).toBe(false)
  })

  it('keeps separate counts per client and per form', () => {
    for (let attempt = 0; attempt < 6; attempt += 1) checkRateLimit('general:203.0.113.3')

    expect(checkRateLimit('general:203.0.113.3')).toBe(false)
    expect(checkRateLimit('general:203.0.113.4')).toBe(true)
    expect(checkRateLimit('landlord:203.0.113.3')).toBe(true)
  })
})
