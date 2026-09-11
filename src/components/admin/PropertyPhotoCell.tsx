import React from 'react'
import type { DefaultServerCellComponentProps } from 'payload'

import { toImage } from '@/lib/properties/mappers'

/**
 * First photograph in the Properties list. The stock upload cell shows up to
 * three filenames; the owner needs a picture they can recognise at a glance.
 *
 * This is the first column, so Payload treats it as the document link. The
 * wrap has to live here: a custom cell replaces the default linked cell.
 */
export async function PropertyPhotoCell({
  cellData,
  collectionSlug,
  link,
  linkURL,
  payload,
  rowData,
}: DefaultServerCellComponentProps) {
  const first = Array.isArray(cellData) ? cellData[0] : cellData
  let image = toImage(first)

  if (!image && (typeof first === 'number' || typeof first === 'string')) {
    try {
      const doc = await payload.findByID({ collection: 'media', id: first, depth: 0 })
      image = toImage(doc)
    } catch {
      image = undefined
    }
  }

  const inner = image ? (
    <span className="property-photo-cell">
      {/* Not next/image: this renders inside Payload's admin bundle. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.thumbnailUrl ?? image.cardUrl ?? image.url}
        alt={image.alt || 'Property photo'}
      />
    </span>
  ) : (
    <span className="property-photo-cell property-photo-cell--empty">No photo</span>
  )

  if (!link) return inner

  const href =
    linkURL ?? `/admin/collections/${collectionSlug}/${encodeURIComponent(String(rowData.id))}`

  return <a href={href}>{inner}</a>
}
