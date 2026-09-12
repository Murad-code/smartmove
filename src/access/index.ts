import type { Access, FieldAccess } from 'payload'

import type { User } from '@/payload-types'
import { exceptRootAccount, isRootAdminEmail } from '@/lib/root-user'

/**
 * Access helpers.
 *
 * Two roles only: `admin` manages everything including staff accounts;
 * `editor` manages the day-to-day content a letting agent touches. The
 * ROOT_ADMIN_EMAIL owner is also an admin, but other admins cannot see or
 * delete that row, so a staff change cannot lock the developer out.
 */

function roleOf(user: unknown): User['role'] | undefined {
  return (user as User | undefined | null)?.role
}

function emailOf(user: unknown): string | undefined {
  const email = (user as User | undefined | null)?.email
  return typeof email === 'string' ? email : undefined
}

export const anyone: Access = () => true

export const isAdmin: Access = ({ req: { user } }) => roleOf(user) === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) => roleOf(user) === 'admin'

/** Admins may delete staff accounts except the owner in ROOT_ADMIN_EMAIL. */
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

/**
 * The owner account sees every row. Other admins see staff except the owner.
 * Everyone else may only touch their own account.
 */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isRootAdminEmail(emailOf(user))) return true
  if (roleOf(user) === 'admin') return exceptRootAccount()
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
