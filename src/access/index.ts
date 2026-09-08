import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'
import { isRootAdminEmail } from '@/lib/root-user'

/**
 * Access helpers.
 *
 * Two roles only: `admin` manages everything including staff accounts;
 * `editor` manages the day-to-day content a letting agent touches. Anything
 * that could lock the owner out of their own site is admin-only.
 */

function roleOf(user: unknown): User['role'] | undefined {
  return (user as User | undefined | null)?.role
}

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'

/** Admins may delete staff accounts except the owner address in SEED_ADMIN_EMAIL. */
export const isAdminNotRoot: Access = async ({ req, id }) => {
  if (roleOf(req.user) !== 'admin') return false
  if (!id) return true

  const account = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
    overrideAccess: true,
  })

  return !isRootAdminEmail(account.email)
}

export const isStaff: Access = ({ req: { user } }) => {
  const role = roleOf(user)
  return role === 'admin' || role === 'editor'
}

/** Admins manage any account; everyone else may only touch their own. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (roleOf(user) === 'admin') return true
  return { id: { equals: user.id } }
}

/**
 * Public reads see published documents; signed-in staff see everything so the
 * admin panel and live preview show drafts.
 */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (roleOf(user)) return true
  return { _status: { equals: 'published' } }
}
