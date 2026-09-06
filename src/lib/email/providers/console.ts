import { logger } from '@/lib/logger'

import type { EmailProvider } from '../types'

/**
 * Development provider. Records that a message would have been sent without
 * logging its body, which would put personal data in the logs.
 */
export const consoleProvider: EmailProvider = {
  name: 'console',
  async send(message) {
    logger.info('Email notification (not sent: EMAIL_PROVIDER=console)', {
      to: message.to,
      subject: message.subject,
    })
  },
}
