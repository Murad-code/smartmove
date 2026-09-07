'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

/**
 * First item in the admin sidebar. The rest of the menu is collections and
 * settings; without this it is not obvious how to get back to the homepage.
 */
export function DashboardNavLink() {
  const pathname = usePathname()
  const current = pathname === '/admin' || pathname === '/admin/'

  return (
    <div className="nav-dashboard">
      <Link
        className={current ? 'nav__link active' : 'nav__link'}
        href="/admin"
        prefetch={false}
        {...(current ? { 'aria-current': 'page' as const } : {})}
      >
        Dashboard
      </Link>
    </div>
  )
}
