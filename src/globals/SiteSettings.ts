import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'

const linkFields = [
  {
    type: 'row' as const,
    fields: [
      {
        name: 'label',
        type: 'text' as const,
        required: true,
        label: 'Menu text',
        admin: { width: '50%' },
      },
      {
        name: 'href',
        type: 'text' as const,
        required: true,
        label: 'Where it goes',
        admin: { width: '50%', placeholder: '/landlords' },
      },
    ],
  },
]

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Website Settings',
  admin: {
    group: 'Settings',
    description: 'Your logo, menus and how the website appears in Google.',
  },
  access: {
    read: anyone,
    update: isStaff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Branding',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
              admin: { description: 'A wide logo on a transparent background works best.' },
            },
            {
              name: 'logoLight',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo for dark backgrounds',
              admin: { description: 'Used in the footer. Leave blank to use the main logo.' },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Browser tab icon',
            },
          ],
        },
        {
          label: 'Main menu',
          fields: [
            {
              name: 'mainNav',
              type: 'array',
              label: 'Menu items',
              labels: { singular: 'Menu item', plural: 'Menu items' },
              maxRows: 8,
              admin: {
                description: 'Shown across the top of every page. Drag to reorder.',
                initCollapsed: false,
              },
              fields: linkFields,
            },
            {
              name: 'headerCta',
              type: 'group',
              label: 'Button at the end of the menu',
              fields: [
                { name: 'label', type: 'text', label: 'Button text' },
                { name: 'href', type: 'text', label: 'Where it goes' },
              ],
            },
          ],
        },
        {
          label: 'Footer',
          fields: [
            {
              name: 'footerColumns',
              type: 'array',
              label: 'Footer link columns',
              labels: { singular: 'Column', plural: 'Columns' },
              maxRows: 3,
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Column heading' },
                {
                  name: 'links',
                  type: 'array',
                  label: 'Links',
                  labels: { singular: 'Link', plural: 'Links' },
                  fields: linkFields,
                },
              ],
            },
            {
              name: 'legalLinks',
              type: 'array',
              label: 'Small print links',
              labels: { singular: 'Link', plural: 'Links' },
              admin: { description: 'The row of small links at the very bottom.' },
              fields: linkFields,
            },
          ],
        },
        {
          label: 'Search engines',
          description: 'Used when a page has not been given its own wording.',
          fields: [
            {
              name: 'defaultSeo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'titleSuffix',
                  type: 'text',
                  label: 'Added after every page title',
                  defaultValue: 'Smart Move — Letting Agents in Scunthorpe',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  maxLength: 200,
                  label: 'Default description',
                },
                {
                  name: 'shareImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Default sharing image',
                  admin: {
                    description: 'Shown when someone shares a link on Facebook or WhatsApp.',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
