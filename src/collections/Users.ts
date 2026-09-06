import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf } from '@/access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Person', plural: 'People' },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Settings',
    description: 'People who can sign in and manage this website.',
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
    // Only admins see the "People" section at all.
    admin: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Full name',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      label: 'What can this person do?',
      options: [
        { label: 'Manage everything, including staff accounts', value: 'admin' },
        { label: 'Manage properties, pages and enquiries', value: 'editor' },
      ],
      // Without this an editor could promote themselves to admin.
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description: 'Only choose the first option for people you fully trust.',
      },
    },
  ],
}
