'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import { cn } from '@/lib/cn'

import type { NavLink } from './MobileNav'

/**
 * Desktop navigation. A client component purely so the current page can be
 * marked with `aria-current`, which needs the pathname.
 */
export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname()

  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => {
        const current = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'relative rounded-lg px-3 py-2 text-[0.95rem] font-medium transition-colors',
                current ? 'text-navy-800' : 'text-ink-600 hover:text-navy-800',
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-3 -bottom-0.5 block h-0.5 rounded-full transition-colors',
                  current ? 'bg-accent-400' : 'bg-transparent',
                )}
              />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
