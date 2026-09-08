import { APIError, type CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminNotRoot, isAdminOrSelf } from '@/access'
import { isRootAdminEmail } from '@/lib/root-user'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
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
    description: 'Accounts that can sign in and manage this website.',
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdminNotRoot,
    // Only admins see the Users section at all.
    admin: ({ req: { user } }) => {
      if (!user || !('role' in user)) return false
      return user.role === 'admin'
    },
  },
  hooks: {
    beforeDelete: [
      async ({ req, id }) => {
        const account = await req.payload.findByID({
          collection: 'users',
          id,
          depth: 0,
          overrideAccess: true,
        })
        if (isRootAdminEmail(account.email)) {
          throw new APIError('The owner account cannot be deleted.', 403)
        }
      },
    ],
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
      saveToJWT: true,
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
