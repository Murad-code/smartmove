import Link from 'next/link'
import React from 'react'

/**
 * A labelled log out control in the admin header, beside the profile icon.
 * The sidebar already has a small icon for the same action; this one is
 * written in plain English so the owner does not have to hunt for it.
 */
export function HeaderLogout() {
  return (
    <Link className="header-log-out" href="/admin/logout" prefetch={false}>
      Log out
    </Link>
  )
}
