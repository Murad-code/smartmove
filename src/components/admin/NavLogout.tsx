import Link from 'next/link'
import React from 'react'

/**
 * Sidebar log out control. Payload's default is an icon with no label, which
 * is easy to miss at the bottom of the menu on a phone.
 */
export function NavLogout() {
  return (
    <Link className="nav__log-out" href="/admin/logout" prefetch={false}>
      Log out
      <svg
        aria-hidden="true"
        className="icon icon--logout"
        fill="none"
        height="22"
        viewBox="0 0 24 24"
        width="22"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="stroke"
          d="M16 17l5-5-5-5M21 12H9M13 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </Link>
  )
}
