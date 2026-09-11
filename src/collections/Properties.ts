import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'
import { slugField } from '@/fields/slug'

/**
 * Properties.
 *
 * The field layout is driven by one goal from the brief: the owner should be
 * able to add a complete listing in about two minutes. Everything needed to
 * publish lives in the first tab in the order an agent would read it off a
 * property sheet; anything optional is pushed into later tabs.
 *
 * Lettings only. The previous site had an empty "for sale" section and we have
 * not confirmed whether sales are still offered, so a `listingType` split was
 * left out rather than shipped half-supported. See
 * docs/property-integration-future.md.
 */

export const PROPERTY_STATUSES = ['draft', 'available', 'let-agreed', 'let'] as const
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number]

/** Statuses a visitor is allowed to see. `let` and `draft` are hidden. */
export const PUBLIC_PROPERTY_STATUSES: PropertyStatus[] = ['available', 'let-agreed']

export const PROPERTY_TYPES = [
  { label: 'House — detached', value: 'detached' },
  { label: 'House — semi-detached', value: 'semi-detached' },
  { label: 'House — terraced', value: 'terraced' },
  { label: 'Flat or apartment', value: 'flat' },
  { label: 'Bungalow', value: 'bungalow' },
  { label: 'Room in a shared house', value: 'room' },
  { label: 'Commercial premises', value: 'commercial' },
] as const

export const Properties: CollectionConfig = {
  slug: 'properties',
  labels: { singular: 'Property', plural: 'Properties' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['images', 'title', 'displayLocation', 'monthlyRent', 'status', 'updatedAt'],
    group: 'Properties',
    description: 'Everything you are currently marketing.',
    listSearchableFields: ['title', 'displayLocation', 'postcode'],
    pagination: { defaultLimit: 25 },
  },
  access: {
    // A single `status` field is the only publish control, so drafts are off:
    // two competing "is it live?" switches would confuse the owner.
    read: ({ req: { user } }) => (user ? true : { status: { in: PUBLIC_PROPERTY_STATUSES } }),
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        // -------------------------------------------------------------------
        {
          label: 'Property details',
          description: 'Fill these in and the property is ready to publish.',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Property title',
              admin: {
                placeholder: '3 bedroom semi-detached house, Ashby',
                description: 'This is the heading shown on the website.',
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'available',
              index: true,
              label: 'Availability',
              options: [
                { label: 'Available to rent', value: 'available' },
                { label: 'Let agreed', value: 'let-agreed' },
                { label: 'Let — hide from the website', value: 'let' },
                { label: 'Not ready yet — hide from the website', value: 'draft' },
              ],
              admin: {
                description: 'Only "Available" and "Let agreed" properties appear on the website.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'monthlyRent',
                  type: 'number',
                  required: true,
                  min: 0,
                  index: true,
                  label: 'Monthly rent',
                  admin: {
                    width: '50%',
                    step: 5,
                    description: 'In pounds per month, numbers only.',
                    placeholder: '650',
                  },
                },
                {
                  name: 'deposit',
                  type: 'number',
                  min: 0,
                  label: 'Deposit',
                  admin: {
                    width: '50%',
                    step: 5,
                    description: 'Leave blank if you would rather not show it.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bedrooms',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 20,
                  index: true,
                  label: 'Bedrooms',
                  admin: { width: '33%', step: 1 },
                },
                {
                  name: 'bathrooms',
                  type: 'number',
                  min: 0,
                  max: 20,
                  label: 'Bathrooms',
                  admin: { width: '33%', step: 1 },
                },
                {
                  name: 'propertyType',
                  type: 'select',
                  required: true,
                  index: true,
                  label: 'Property type',
                  options: [...PROPERTY_TYPES],
                  admin: { width: '34%' },
                },
              ],
            },
            {
              name: 'displayLocation',
              type: 'text',
              required: true,
              label: 'Area shown on the website',
              admin: {
                placeholder: 'Ashby, Scunthorpe',
                description:
                  'The area buyers search by. The full address goes on the Address tab and is never shown publicly.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'furnishedStatus',
                  type: 'select',
                  label: 'Furnishing',
                  options: [
                    { label: 'Unfurnished', value: 'unfurnished' },
                    { label: 'Part furnished', value: 'part-furnished' },
                    { label: 'Furnished', value: 'furnished' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'availableFrom',
                  type: 'date',
                  label: 'Available from',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
                    description: 'Leave blank if it is available now.',
                  },
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              required: true,
              maxLength: 220,
              label: 'One-line summary',
              admin: {
                description:
                  'Shown on the property cards and in Google results. Around 25 words works best.',
              },
            },
            {
              name: 'keyFeatures',
              type: 'text',
              hasMany: true,
              maxRows: 12,
              label: 'Key features',
              admin: {
                description:
                  'Short bullet points, for example "Off-street parking". Type one and press Enter to add it.',
                placeholder: 'Type a feature and press Enter',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Full description',
              admin: {
                description: 'The main write-up shown on the property page.',
              },
            },
          ],
        },
        // -------------------------------------------------------------------
        {
          label: 'Photos',
          description: 'The first photo is used as the main picture. Drag to reorder.',
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              displayPreview: true,
              label: 'Photo',
              admin: {
                description:
                  'You can select several at once. The first photo is the main picture. Drag them into the order you want them shown.',
                disableListFilter: true,
                components: {
                  Cell: '@/components/admin/PropertyPhotoCell#PropertyPhotoCell',
                },
              },
            },
          ],
        },
        // -------------------------------------------------------------------
        {
          label: 'Address',
          description:
            'For your records and for the map. Only the area and postcode are shown publicly.',
          fields: [
            {
              name: 'addressLine1',
              type: 'text',
              label: 'Address line 1',
            },
            {
              name: 'addressLine2',
              type: 'text',
              label: 'Address line 2',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'townCity',
                  type: 'text',
                  label: 'Town or city',
                  defaultValue: 'Scunthorpe',
                  admin: { width: '50%' },
                },
                {
                  name: 'county',
                  type: 'text',
                  label: 'County',
                  defaultValue: 'North Lincolnshire',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'postcode',
              type: 'text',
              label: 'Postcode',
              admin: {
                placeholder: 'DN15 7JW',
                description: 'Used for the map link on the property page.',
              },
            },
          ],
        },
        // -------------------------------------------------------------------
        {
          label: 'More details',
          description: 'Optional. Anything left blank is simply not shown.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'epcRating',
                  type: 'select',
                  label: 'EPC rating',
                  options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((value) => ({
                    label: value,
                    value,
                  })),
                  admin: { width: '50%' },
                },
                {
                  name: 'councilTaxBand',
                  type: 'select',
                  label: 'Council tax band',
                  options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((value) => ({
                    label: value,
                    value,
                  })),
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'petsConsidered',
              type: 'checkbox',
              label: 'Pets considered',
            },
            {
              name: 'gardenIncluded',
              type: 'checkbox',
              label: 'Has a garden',
            },
            {
              name: 'parking',
              type: 'select',
              label: 'Parking',
              options: [
                { label: 'None', value: 'none' },
                { label: 'On-street', value: 'on-street' },
                { label: 'Off-street or driveway', value: 'off-street' },
                { label: 'Garage', value: 'garage' },
              ],
            },
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    // Sidebar
    // ---------------------------------------------------------------------
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the home page',
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Ticked properties appear in the featured section on the home page.',
      },
    },
    slugField('title'),
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Date added',
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' },
        description: 'Controls the order properties are listed in. Newest first.',
      },
      hooks: {
        beforeChange: [({ value }) => value ?? new Date().toISOString()],
      },
    },
  ],
}
