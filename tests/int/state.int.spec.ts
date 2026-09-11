import { describe, expect, it } from 'vitest'

import { IDLE_STATE, errorState, formValues, submittedFieldValues } from '@/lib/forms/state'

describe('submittedFieldValues', () => {
  it('keeps what the visitor typed and drops anti-spam fields', () => {
    const formData = new FormData()
    formData.set('name', 'Jane Fletcher')
    formData.set('email', 'jane@example.com')
    formData.set('companyWebsite', 'https://spam.example')
    formData.set('renderedAt', '123')
    formData.set('cf-turnstile-response', 'token')

    expect(submittedFieldValues(formData)).toEqual({
      name: 'Jane Fletcher',
      email: 'jane@example.com',
    })
  })
})

describe('errorState', () => {
  it('carries the typed values so a failed submit can restore the form', () => {
    const formData = new FormData()
    formData.set('name', 'Jane Fletcher')
    formData.set('message', 'I would like to arrange a viewing next week if possible.')

    const first = errorState(
      IDLE_STATE,
      formData,
      'Please check the highlighted fields and try again.',
      {
        consent: 'Please confirm you are happy for us to contact you',
      },
    )

    expect(first.status).toBe('error')
    if (first.status !== 'error') return
    expect(first.attempt).toBe(1)
    expect(first.values.name).toBe('Jane Fletcher')
    expect(formValues(first).message).toContain('arrange a viewing')

    const second = errorState(first, formData, first.message)
    expect(second.status).toBe('error')
    if (second.status !== 'error') return
    expect(second.attempt).toBe(2)
  })
})
