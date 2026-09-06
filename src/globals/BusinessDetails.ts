import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access'

/**
 * Business Details.
 *
 * The single source of truth for anything that would otherwise be repeated in
 * templates: phone numbers, address, opening hours, compliance memberships.
 * Every component reads from here, so changing the phone number is one edit.
 */
export const BusinessDetails: GlobalConfig = {
  slug: 'business-details',
  label: 'Business Details',
  admin: {
    group: 'Settings',
    description: 'Your contact details and company information, used all over the website.',
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
          label: 'Contact',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              required: true,
              defaultValue: 'Smart Move',
              label: 'Company name',
            },
            {
              name: 'tagline',
              type: 'text',
              label: 'Short strapline',
              admin: { placeholder: 'Property letting and management in Scunthorpe' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'telephone',
                  type: 'text',
                  required: true,
                  label: 'Main telephone',
                  admin: { width: '50%', placeholder: '01724 856260' },
                },
                {
                  name: 'secondaryTelephone',
                  type: 'text',
                  label: 'Second telephone (optional)',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  required: true,
                  label: 'Main email',
                  admin: { width: '50%' },
                },
                {
                  name: 'enquiriesEmail',
                  type: 'email',
                  label: 'Where website enquiries go',
                  admin: {
                    width: '50%',
                    description: 'Leave blank to use the main email.',
                  },
                },
              ],
            },
            {
              name: 'address',
              type: 'group',
              label: 'Office address',
              fields: [
                { name: 'line1', type: 'text', required: true, label: 'Address line 1' },
                { name: 'line2', type: 'text', label: 'Address line 2' },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'town',
                      type: 'text',
                      required: true,
                      label: 'Town',
                      admin: { width: '50%' },
                    },
                    { name: 'county', type: 'text', label: 'County', admin: { width: '50%' } },
                  ],
                },
                { name: 'postcode', type: 'text', required: true, label: 'Postcode' },
              ],
            },
            {
              name: 'mapUrl',
              type: 'text',
              label: 'Link to your location on a map',
              admin: {
                description: 'Paste a Google Maps link. Leave blank to build one from the address.',
              },
            },
          ],
        },
        {
          label: 'Opening hours',
          fields: [
            {
              name: 'openingHours',
              type: 'array',
              label: 'Opening hours',
              labels: { singular: 'Line', plural: 'Lines' },
              admin: {
                description: 'One line per row, shown in the order you put them in.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'days',
                      type: 'text',
                      required: true,
                      label: 'Days',
                      admin: { width: '50%', placeholder: 'Monday to Friday' },
                    },
                    {
                      name: 'hours',
                      type: 'text',
                      required: true,
                      label: 'Hours',
                      admin: { width: '50%', placeholder: '9:30am – 5:30pm' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Social media',
          fields: [
            {
              name: 'social',
              type: 'group',
              label: false,
              fields: [
                { name: 'facebook', type: 'text', label: 'Facebook page address' },
                { name: 'instagram', type: 'text', label: 'Instagram address' },
                { name: 'x', type: 'text', label: 'X (Twitter) address' },
                { name: 'linkedin', type: 'text', label: 'LinkedIn address' },
              ],
            },
          ],
        },
        {
          label: 'Company and compliance',
          description:
            'Letting agents in England must display their redress scheme and Client Money Protection membership. Anything left blank is simply not shown.',
          fields: [
            { name: 'registeredName', type: 'text', label: 'Registered company name' },
            {
              type: 'row',
              fields: [
                {
                  name: 'companyNumber',
                  type: 'text',
                  label: 'Company number',
                  admin: { width: '50%' },
                },
                {
                  name: 'vatNumber',
                  type: 'text',
                  label: 'VAT number',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'redressScheme',
              type: 'text',
              label: 'Property redress scheme',
              admin: { placeholder: 'The Property Ombudsman — membership number …' },
            },
            {
              name: 'clientMoneyProtection',
              type: 'text',
              label: 'Client Money Protection scheme',
            },
            {
              name: 'depositScheme',
              type: 'text',
              label: 'Deposit protection scheme',
            },
            {
              name: 'footerNote',
              type: 'textarea',
              label: 'Extra footer text',
              admin: { description: 'Anything else you want at the bottom of every page.' },
            },
          ],
        },
      ],
    },
  ],
}
