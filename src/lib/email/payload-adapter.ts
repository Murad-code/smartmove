import type { PayloadEmailAdapter, SendEmailOptions } from 'payload'

import { env } from '@/lib/env'

import { getEmailProvider } from './index'

/**
 * Payload's email adapter, built on the provider layer this app already uses
 * for enquiry notifications.
 *
 * Payload sends password resets and admin invitations through `payload.sendEmail`.
 * Without an adapter those are written to the console, which in production
 * would leave a locked-out member of staff with no way back in.
 *
 * There is a first-party `@payloadcms/email-resend` package, but it would be a
 * second Resend client alongside `providers/resend.ts` and a dependency the
 * site does not need. Routing through `getEmailProvider` also means
 * `EMAIL_PROVIDER=console` silences reset emails in development exactly as it
 * does enquiry notifications.
 */

/** Splits `Name <address@example.com>` into its parts. */
function parseFromAddress(value: string): { name: string; address: string } {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (!match) return { name: 'Smart Move', address: value.trim() }

  const name = match[1].replace(/^"|"$/g, '').trim()
  return { name: name || 'Smart Move', address: match[2].trim() }
}

/** Flattens Nodemailer's address shapes, which Payload's options inherit. */
function toRecipients(to: SendEmailOptions['to']): string[] {
  const values = Array.isArray(to) ? to : [to]

  return values
    .map((value) => {
      if (typeof value === 'string') return value
      return value?.address ?? ''
    })
    .map((address) => address.trim())
    .filter(Boolean)
}

/**
 * Nodemailer accepts streams for a body. Nothing in this app sends one, and
 * failing loudly beats posting an empty email to the provider.
 */
function toBody(value: SendEmailOptions['html' | 'text'], field: string): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string') return value
  if (Buffer.isBuffer(value)) return value.toString('utf8')

  throw new Error(`Unsupported ${field} type in email: streams are not supported`)
}

export const payloadEmailAdapter: PayloadEmailAdapter = () => {
  const { name, address } = parseFromAddress(env.email.from)

  return {
    name: 'smart-move',
    defaultFromAddress: address,
    defaultFromName: name,
    async sendEmail(message) {
      const recipients = toRecipients(message.to)
      if (!recipients.length) {
        throw new Error('Email has no recipient')
      }

      const text = toBody(message.text, 'text')
      const html = toBody(message.html, 'html')

      // `message.from` is deliberately ignored. The sender has to match a
      // domain verified with the provider, so it is a deployment concern that
      // belongs in EMAIL_FROM rather than at each call site.
      await getEmailProvider().send({
        to: recipients,
        subject: message.subject ?? '',
        text:
          text ||
          html
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim(),
        html: html || text,
        replyTo: toRecipients(message.replyTo)[0],
      })
    },
  }
}
