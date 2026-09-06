import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { logger } from '@/lib/logger'

/**
 * Health check for Docker and the reverse proxy.
 *
 * Touches the database so an app that is up but cannot reach Postgres is
 * reported unhealthy. Returns nothing about the environment: an unauthenticated
 * endpoint should not describe the system it is protecting.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'properties', overrideAccess: true })
    return NextResponse.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    logger.error('Health check failed', error)
    return NextResponse.json(
      { status: 'error' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
