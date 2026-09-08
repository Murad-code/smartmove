/**
 * The address in SEED_ADMIN_EMAIL is the owner account created on first boot.
 * It can create other admins; it cannot be deleted, so a staff change cannot
 * lock the developer out of a site they set up.
 */

export function rootAdminEmail(): string {
  return (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase()
}

export function isRootAdminEmail(email: string | null | undefined): boolean {
  const root = rootAdminEmail()
  if (!root || !email) return false
  return email.trim().toLowerCase() === root
}
