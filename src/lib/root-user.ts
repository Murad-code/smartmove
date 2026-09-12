import type { Where } from 'payload'

/**
 * The owner account. Created on boot from ROOT_ADMIN_EMAIL (SEED_ADMIN_EMAIL
 * is still accepted). It can sign in with full admin rights, cannot be
 * deleted, and is hidden from other admins on the Users list.
 */

export function configuredRootEmail(): string {
  return (process.env.ROOT_ADMIN_EMAIL || process.env.SEED_ADMIN_EMAIL || '').trim()
}

export function configuredRootPassword(): string {
  return process.env.ROOT_ADMIN_PASSWORD || process.env.SEED_ADMIN_PASSWORD || ''
}

export function rootAdminEmail(): string {
  return configuredRootEmail().toLowerCase()
}

export function isRootAdminEmail(email: string | null | undefined): boolean {
  const root = rootAdminEmail()
  if (!root || !email) return false
  return email.trim().toLowerCase() === root
}

/** Emails that identify the owner row, including the original casing from env. */
export function rootAdminEmails(): string[] {
  const raw = configuredRootEmail()
  if (!raw) return []
  const lower = raw.toLowerCase()
  return lower === raw ? [raw] : [raw, lower]
}

/**
 * Hide the owner account from a query. `true` means "no extra constraint"
 * when the address is not configured.
 */
export function exceptRootAccount(): true | Where {
  const emails = rootAdminEmails()
  if (emails.length === 0) return true
  return { email: { not_in: emails } }
}
