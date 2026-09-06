import { env } from '@/lib/env'

import type { EmailProvider } from '../types'

/**
 * Resend, called over its REST API rather than through the SDK. One `fetch`
 * is all that is needed and it keeps a dependency out of the server bundle.
 */
export const resendProvider: EmailProvider = {
  name: 'resend',
  async send(message) {
    if (!env.email.resendApiKey) {
      throw new Error('RESEND_API_KEY is not set')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.email.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) {
      // The body carries Resend's reason; the API key is never in it.
      const detail = await response.text().catch(() => '')
      throw new Error(`Resend responded ${response.status}: ${detail.slice(0, 300)}`)
    }
  },
}
