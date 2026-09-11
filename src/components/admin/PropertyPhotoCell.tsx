import React from 'react'
import type { DefaultServerCellComponentProps } from 'payload'

import { toImage } from '@/lib/properties/mappers'

/**
 * First photograph in the Properties list. The stock upload cell shows up to
 * three filenames; the owner needs a picture they can recognise at a glance.
 */
export async function PropertyPhotoCell({ cellData, payload }: DefaultServerCellComponentProps) {
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

  if (!image) {
    return <span className="property-photo-cell property-photo-cell--empty">No photo</span>
  }

  return (
    <span className="property-photo-cell">
      {/* Not next/image: this renders inside Payload's admin bundle. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.thumbnailUrl ?? image.cardUrl ?? image.url}
        alt={image.alt || 'Property photo'}
      />
    </span>
  )
}
