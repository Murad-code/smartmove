import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { NextResponse } from 'next/server'

import { brandInitial, letterMarkSvg } from '@/lib/brand'
import { env } from '@/lib/env'
import { logger } from '@/lib/logger'
import { toImage } from '@/lib/properties/mappers'
import { getBusinessDetails, getSiteSettings } from '@/lib/site'

/**
 * Compact brand mark for browser tabs and the admin navigation.
 *
 * Lives outside `(frontend)` so `/[slug]` cannot swallow it. Reads the favicon
 * from Website Settings at request time; falls back to a letter mark, then to
 * the committed SVG if the database is unreachable (as during a Docker build).
 */
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

export async function GET() {
  try {
    const [settings, business] = await Promise.all([getSiteSettings(), getBusinessDetails()])
    const favicon = toImage(settings.favicon)

    if (favicon) {
      return NextResponse.redirect(new URL(favicon.url, env.siteUrl), {
        headers: NO_STORE,
      })
    }

    const svg = letterMarkSvg(brandInitial(business.companyName))
    return new NextResponse(svg, {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', ...NO_STORE },
    })
  } catch (error) {
    logger.error('Brand icon fallback', error)
    const file = await readFile(path.join(process.cwd(), 'public/icon.svg'))
    return new NextResponse(file, {
      headers: { 'Content-Type': 'image/svg+xml; charset=utf-8', ...NO_STORE },
    })
  }
}
