import { APIError, type Endpoint } from 'payload'

import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { runSeed } from '@/scripts/seed-run'

/**
 * Admin-only. Loads starter content plus the third-party demo properties.
 * Preview deployments only (`SITE_NOINDEX=true`), so a live client site cannot
 * pick this up by accident.
 */
export const seedDemoEndpoint: Endpoint = {
  path: '/seed-demo',
  method: 'post',
  handler: async (req) => {
    const role = req.user && 'role' in req.user ? req.user.role : undefined
    if (role !== 'admin') {
      throw new APIError('Only an admin can load demo properties.', 403)
    }

    if (env.isProduction && !env.noindex) {
      throw new APIError(
        'Demo properties can only be loaded on a preview site with SITE_NOINDEX=true.',
        403,
      )
    }

    logger.info('Demo seed started from the admin panel', { userId: req.user?.id })

    await runSeed(req.payload, { includeDemoProperties: true })

    return Response.json({
      ok: true,
      message: 'Demo properties loaded. Delete them before this site goes live.',
    })
  },
}
