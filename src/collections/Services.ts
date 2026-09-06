import type { CollectionConfig } from 'payload'

import { isStaff, publishedOrStaff } from '@/access'
import { pageBlocks } from '@/blocks'
import { slugField } from '@/fields/slug'
import { revalidateService, revalidateServiceOnDelete } from '@/hooks/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: { singular: 'Service', plural: 'Services' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', 'updatedAt'],
    group: 'Website content',
    description: 'What Smart Move offers. Each one gets its own page.',
  },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  versions: { drafts: true },
  defaultSort: 'order',
  hooks: {
    afterChange: [revalidateService],
    afterDelete: [revalidateServiceOnDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Service name',
      admin: { placeholder: 'Property management' },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      maxLength: 220,
      label: 'One-line summary',
      admin: { description: 'Shown on the services overview and in search results.' },
    },
    {
      name: 'icon',
      type: 'select',
      label: 'Icon',
      defaultValue: 'key',
      options: [
        { label: 'Key', value: 'key' },
        { label: 'House', value: 'house' },
        { label: 'Shield', value: 'shield' },
        { label: 'Spanner', value: 'spanner' },
        { label: 'Chart', value: 'chart' },
        { label: 'Document', value: 'document' },
        { label: 'People', value: 'people' },
        { label: 'Pound sign', value: 'pound' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      label: 'Mainly for',
      defaultValue: 'landlords',
      options: [
        { label: 'Landlords', value: 'landlords' },
        { label: 'Tenants', value: 'tenants' },
        { label: 'Everyone', value: 'everyone' },
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page sections',
      labels: { singular: 'Section', plural: 'Sections' },
      blocks: pageBlocks,
    },
    {
      name: 'order',
      type: 'number',
      label: 'Position in the list',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        step: 10,
        description: 'Lower numbers appear first.',
      },
    },
    slugField('title'),
  ],
}
