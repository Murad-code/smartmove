import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access'

export const ENQUIRY_KINDS = ['general', 'property', 'landlord', 'requirements'] as const
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number]

/**
 * Enquiries.
 *
 * Records are created only by the server actions in `src/lib/forms`, never by
 * the public API and never by hand in the admin panel, so `create` is closed
 * to everyone and the actions pass `overrideAccess: true`. Staff can read,
 * triage and delete: deletion is how a subject-erasure request is honoured.
 *
 * Nothing is stored that the person did not type. No IP addresses, no user
 * agents.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'handled', 'createdAt'],
    group: 'Enquiries',
    description: 'Messages sent through the website.',
    listSearchableFields: ['name', 'email', 'telephone'],
    pagination: { defaultLimit: 25 },
  },
  access: {
    read: isStaff,
    create: () => false,
    update: isStaff,
    delete: isStaff,
  },
  defaultSort: '-createdAt',
  timestamps: true,
  fields: [
    {
      name: 'handled',
      type: 'checkbox',
      label: 'Dealt with',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Tick once you have replied.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Your notes',
      admin: {
        position: 'sidebar',
        description: 'Only visible here. The sender never sees this.',
      },
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      label: 'Type of enquiry',
      options: [
        { label: 'General enquiry', value: 'general' },
        { label: 'About a property', value: 'property' },
        { label: 'From a landlord', value: 'landlord' },
        { label: 'Property requirements', value: 'requirements' },
      ],
      admin: { readOnly: true },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Name',
          admin: { readOnly: true, width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email',
          admin: { readOnly: true, width: '50%' },
        },
      ],
    },
    {
      name: 'telephone',
      type: 'text',
      label: 'Telephone',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      admin: { readOnly: true },
    },
    {
      name: 'property',
      type: 'relationship',
      relationTo: 'properties',
      label: 'Property',
      admin: {
        readOnly: true,
        condition: (data) => data?.kind === 'property',
      },
    },
    {
      name: 'preferredViewing',
      type: 'text',
      label: 'Preferred viewing time',
      admin: {
        readOnly: true,
        condition: (data) => data?.kind === 'property',
      },
    },
    {
      name: 'enquiryTopic',
      type: 'text',
      label: 'Enquiring about',
      admin: {
        readOnly: true,
        condition: (data) => data?.kind === 'general',
      },
    },
    {
      name: 'landlord',
      type: 'group',
      label: 'Landlord details',
      admin: { condition: (data) => data?.kind === 'landlord' },
      fields: [
        { name: 'postcode', type: 'text', label: 'Property postcode', admin: { readOnly: true } },
        {
          name: 'serviceInterest',
          type: 'text',
          label: 'Interested in',
          admin: { readOnly: true },
        },
      ],
    },
    {
      name: 'requirements',
      type: 'group',
      label: 'What they are looking for',
      admin: { condition: (data) => data?.kind === 'requirements' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'preferredArea',
              type: 'text',
              label: 'Preferred area',
              admin: { readOnly: true, width: '50%' },
            },
            {
              name: 'propertyType',
              type: 'text',
              label: 'Property type',
              admin: { readOnly: true, width: '50%' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minBedrooms',
              type: 'number',
              label: 'Minimum bedrooms',
              admin: { readOnly: true, width: '50%' },
            },
            {
              name: 'maxRent',
              type: 'number',
              label: 'Maximum monthly rent',
              admin: { readOnly: true, width: '50%' },
            },
          ],
        },
        { name: 'moveDate', type: 'text', label: 'Looking to move', admin: { readOnly: true } },
      ],
    },
    {
      name: 'consentGivenAt',
      type: 'date',
      label: 'Agreed to the privacy policy at',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Recorded automatically as proof of consent.',
      },
    },
    {
      name: 'sourcePage',
      type: 'text',
      label: 'Sent from',
      admin: { readOnly: true },
    },
  ],
}
