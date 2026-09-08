'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

/**
 * Refreshes the page whenever the admin panel saves the document being
 * previewed. Pages and Services autosave as the owner types, so in practice
 * the preview keeps up with the keyboard; the Home Page and Properties refresh
 * when the owner saves.
 *
 * Only rendered for a signed-in member of staff, and only inside the preview
 * iframe. `serverURL` is checked against the message origin, so a page framed
 * by anyone else is ignored.
 */
export function LivePreviewListener({ serverURL }: { serverURL: string }) {
  const router = useRouter()

  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
