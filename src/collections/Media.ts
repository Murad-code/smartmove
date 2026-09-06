import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access'

/** WebP at a quality that is visually clean for property photography. */
const WEBP = { format: 'webp', options: { quality: 82 } } as const

/**
 * Uploads.
 *
 * `staticDir` points at a path that is mounted as a Docker volume in
 * production, so files survive redeploys. Switching to S3-compatible storage
 * later means adding a storage adapter plugin here; nothing else in the app
 * reads from disk directly.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Image or file', plural: 'Media' },
  admin: {
    group: 'Website content',
    description: 'Every photo and file used across the website.',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
  },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
    // Ordered smallest first so `sizes` in the front end can be terse.
    // Each size repeats `formatOptions`: without it the generated sizes keep
    // the uploaded file's format and only the original becomes WebP.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre', formatOptions: WEBP },
      { name: 'card', width: 768, height: 512, position: 'centre', formatOptions: WEBP },
      { name: 'wide', width: 1280, withoutEnlargement: true, formatOptions: WEBP },
      { name: 'hero', width: 1920, withoutEnlargement: true, formatOptions: WEBP },
    ],
    formatOptions: WEBP,
    adminThumbnail: 'thumbnail',
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Describe this image',
      admin: {
        description:
          'A short description for people using a screen reader, for example "Front of a red-brick terraced house".',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
  ],
}
