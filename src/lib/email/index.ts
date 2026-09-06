import { env } from '@/lib/env'
import { logger } from '@/lib/logger'

import { consoleProvider } from './providers/console'
import { resendProvider } from './providers/resend'
import type { EmailMessage, EmailProvider } from './types'

export type { EmailMessage, EmailProvider } from './types'

const PROVIDERS: Record<string, EmailProvider> = {
  console: consoleProvider,
  resend: resendProvider,
}

export function getEmailProvider(): EmailProvider {
  const provider = PROVIDERS[env.email.provider]
  if (provider) return provider

  logger.warn('Unknown EMAIL_PROVIDER, falling back to console', {
    provider: env.email.provider,
  })
  return consoleProvider
}

/**
 * Sends a notification, reporting success rather than throwing.
 *
 * An enquiry is saved to the database before this runs, so a provider outage
 * must never look like a failed submission to the person filling in the form.
 * The failure is logged for staff to pick up instead.
 */
export async function sendNotification(message: EmailMessage): Promise<boolean> {
  if (!message.to.length) {
    logger.warn('No enquiry notification recipient configured', { subject: message.subject })
    return false
  }

  try {
    await getEmailProvider().send(message)
    return true
  } catch (error) {
    logger.error('Failed to send enquiry notification', error, {
      subject: message.subject,
      provider: env.email.provider,
    })
    return false
  }
}
