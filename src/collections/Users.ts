import { APIError, type CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminNotRoot, isAdminOrSelf, isStaff } from '@/access'
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
    // The Users list is how staff accounts are created and removed. Editors
    // still sign in; they change their own name and password under Account.
    hidden: ({ user }) => {
      if (!user || !('role' in user)) return true
      return user.role !== 'admin'
    },
  },
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdminNotRoot,
    // On the auth collection this is the admin *panel* gate, not the Users
    // nav item. Both roles must pass or an editor is locked out after login.
    admin: ({ req }) => Boolean(isStaff({ req })),
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
        { label: 'Can manage the website and other staff accounts', value: 'admin' },
        { label: 'Can manage the website, but not other staff accounts', value: 'editor' },
      ],
      // Without this an editor could promote themselves to admin.
      access: {
        create: isAdminField,
        update: isAdminField,
      },
      admin: {
        description:
          'The second option can still sign in and look after listings, pages and enquiries. Only choose the first option for people you fully trust.',
      },
    },
  ],
}
