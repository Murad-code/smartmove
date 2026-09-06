import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { slugField } from '@/fields/slug'

/**
 * Website pages.
 *
 * Everything other than the home page, the property listings and the services
 * list is a page here, resolved by slug through the `/[slug]` route. Keeping
 * one system means the owner learns one screen.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Website page', plural: 'Website pages' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    group: 'Website content',
    description: 'The text on your Landlords, Tenants, About, Contact and legal pages.',
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  versions: {
    drafts: { autosave: { interval: 800 } },
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Page title',
    },
    {
      name: 'hero',
      type: 'group',
      label: 'Page header',
      fields: [
        {
          name: 'heading',
          type: 'text',
          label: 'Large heading',
          admin: { description: 'Leave blank to use the page title.' },
        },
        {
          name: 'subheading',
          type: 'textarea',
          label: 'Introduction underneath',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Background photo (optional)',
        },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page sections',
      labels: { singular: 'Section', plural: 'Sections' },
      blocks: pageBlocks,
      admin: {
        description: 'Add sections in the order you want them to appear. Drag to reorder.',
      },
    },
    slugField('title'),
  ],
}
