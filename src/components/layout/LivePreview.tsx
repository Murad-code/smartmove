import React from 'react'

import { env } from '@/lib/env'
import { previewUser } from '@/lib/preview-session'

import { LivePreviewListener } from './LivePreviewListener'

/**
 * Mounts the live preview listener on a previewed page. Renders nothing at all
 * for a visitor, so no site JavaScript is shipped for a feature only the CMS
 * uses.
 */
export async function LivePreview({ enabled }: { enabled: boolean }) {
  if (!enabled || !(await previewUser())) return null

  return <LivePreviewListener serverURL={env.siteUrl} />
}
