import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'
import { iconField } from '@/fields/icon'

/**
 * Home page.
 *
 * A global rather than a page document because the home page has a bespoke
 * layout: the fields map one-to-one onto sections the designer built, which
 * gives a better result than a free-form block list would.
 */
export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Home Page',
  admin: {
    group: 'Website content',
    description: 'The wording on your home page.',
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
          label: 'Top of the page',
          fields: [
            {
              name: 'hero',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'slides',
                  type: 'array',
                  label: 'Banner',
                  labels: { singular: 'Slide', plural: 'Slides' },
                  minRows: 1,
                  maxRows: 5,
                  admin: {
                    description: 'One slide shows as a still banner. Add a second and they rotate.',
                  },
                  fields: [
                    {
                      name: 'heading',
                      type: 'text',
                      required: true,
                      label: 'Main heading',
                      admin: { placeholder: 'Renting made straightforward in Scunthorpe' },
                    },
                    {
                      name: 'subheading',
                      type: 'textarea',
                      label: 'Text underneath',
                    },
                    {
                      name: 'image',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Background photo',
                    },
                    {
                      name: 'primaryCta',
                      type: 'group',
                      label: 'Main button',
                      fields: [
                        { name: 'label', type: 'text', label: 'Button text' },
                        { name: 'href', type: 'text', label: 'Where it goes' },
                      ],
                    },
                    {
                      name: 'secondaryCta',
                      type: 'group',
                      label: 'Second button',
                      fields: [
                        { name: 'label', type: 'text', label: 'Button text' },
                        { name: 'href', type: 'text', label: 'Where it goes' },
                      ],
                    },
                  ],
                },
                {
                  name: 'autoplay',
                  type: 'checkbox',
                  label: 'Move through the slides on their own',
                  defaultValue: true,
                  admin: {
                    description:
                      'Visitors can always use the arrows. Anyone who has asked their device to reduce motion sees a still banner either way.',
                    // Nothing to rotate until there is a second slide.
                    condition: (_data, siblingData) =>
                      Array.isArray(siblingData?.slides) && siblingData.slides.length > 1,
                  },
                },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              label: 'Three short highlights under the heading',
              labels: { singular: 'Highlight', plural: 'Highlights' },
              maxRows: 4,
              fields: [
                { name: 'title', type: 'text', required: true, label: 'Title' },
                { name: 'description', type: 'text', label: 'One short line' },
              ],
            },
          ],
        },
        {
          label: 'Introduction',
          fields: [
            {
              name: 'intro',
              type: 'group',
              label: false,
              fields: [
                { name: 'heading', type: 'text', label: 'Heading' },
                { name: 'body', type: 'richText', label: 'Text' },
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Photo alongside the text',
                },
              ],
            },
            {
              name: 'stats',
              type: 'array',
              label: 'Figures worth putting up front',
              labels: { singular: 'Figure', plural: 'Figures' },
              maxRows: 4,
              admin: {
                description:
                  'Shown as a band across the page. Leave empty to hide it. Four reads best.',
              },
              fields: [
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                  label: 'The figure',
                  admin: { placeholder: '20+' },
                },
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  label: 'What it means',
                  admin: { placeholder: 'Years letting in Scunthorpe' },
                },
              ],
            },
          ],
        },
        {
          label: 'Properties',
          fields: [
            {
              name: 'featuredProperties',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Heading',
                  defaultValue: 'Available to rent now',
                },
                { name: 'intro', type: 'textarea', label: 'Short introduction' },
                {
                  name: 'limit',
                  type: 'number',
                  label: 'How many to show',
                  defaultValue: 3,
                  min: 1,
                  max: 9,
                  admin: {
                    description:
                      'Properties ticked as "Show on the home page" come first, then the newest.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Landlords and tenants',
          fields: [
            {
              name: 'landlords',
              type: 'group',
              label: 'Landlord section',
              fields: [
                { name: 'heading', type: 'text', label: 'Heading' },
                { name: 'body', type: 'textarea', label: 'Text' },
                {
                  name: 'points',
                  type: 'array',
                  label: 'Bullet points',
                  labels: { singular: 'Point', plural: 'Points' },
                  fields: [{ name: 'text', type: 'text', required: true, label: false }],
                },
                {
                  name: 'cta',
                  type: 'group',
                  label: 'Button',
                  fields: [
                    { name: 'label', type: 'text', label: 'Button text' },
                    { name: 'href', type: 'text', label: 'Where it goes' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Photo' },
              ],
            },
            {
              name: 'tenants',
              type: 'group',
              label: 'Tenant section',
              fields: [
                { name: 'heading', type: 'text', label: 'Heading' },
                { name: 'body', type: 'textarea', label: 'Text' },
                {
                  name: 'points',
                  type: 'array',
                  label: 'Bullet points',
                  labels: { singular: 'Point', plural: 'Points' },
                  fields: [{ name: 'text', type: 'text', required: true, label: false }],
                },
                {
                  name: 'cta',
                  type: 'group',
                  label: 'Button',
                  fields: [
                    { name: 'label', type: 'text', label: 'Button text' },
                    { name: 'href', type: 'text', label: 'Where it goes' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media', label: 'Photo' },
              ],
            },
          ],
        },
        {
          label: 'Why Smart Move',
          fields: [
            {
              name: 'whyUs',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Heading',
                  defaultValue: 'Why people choose Smart Move',
                },
                { name: 'intro', type: 'textarea', label: 'Short introduction' },
                {
                  name: 'reasons',
                  type: 'array',
                  label: 'Reasons',
                  labels: { singular: 'Reason', plural: 'Reasons' },
                  maxRows: 6,
                  fields: [
                    { name: 'title', type: 'text', required: true, label: 'Title' },
                    { name: 'description', type: 'textarea', label: 'Description' },
                    iconField({ defaultValue: 'shield' }),
                  ],
                },
              ],
            },
            {
              name: 'closingCta',
              type: 'group',
              label: 'Band at the bottom of the page',
              fields: [
                { name: 'heading', type: 'text', label: 'Heading' },
                { name: 'text', type: 'textarea', label: 'Text' },
                {
                  name: 'buttons',
                  type: 'array',
                  maxRows: 2,
                  label: 'Buttons',
                  labels: { singular: 'Button', plural: 'Buttons' },
                  fields: [
                    { name: 'label', type: 'text', required: true, label: 'Button text' },
                    { name: 'href', type: 'text', required: true, label: 'Where it goes' },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'What people say',
          fields: [
            {
              name: 'testimonials',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Heading',
                  defaultValue: 'What people say about us',
                },
                { name: 'intro', type: 'textarea', label: 'Short introduction' },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Reviews',
                  labels: { singular: 'Review', plural: 'Reviews' },
                  maxRows: 6,
                  admin: {
                    description: 'Leave empty to hide this section. Three reads best.',
                  },
                  fields: [
                    {
                      name: 'quote',
                      type: 'textarea',
                      required: true,
                      label: 'What they said',
                    },
                    { name: 'name', type: 'text', required: true, label: 'Their name' },
                    {
                      name: 'role',
                      type: 'select',
                      label: 'They are a',
                      defaultValue: 'tenant',
                      options: [
                        { label: 'Tenant', value: 'tenant' },
                        { label: 'Landlord', value: 'landlord' },
                        { label: 'Seller', value: 'seller' },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
