'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export interface NavLink {
  label: string
  href: string
}

/**
 * Mobile navigation.
 *
 * The only interactive client component in the header, so the rest of the
 * chrome stays on the server. Focus is moved into the panel on open and the
 * page behind it is locked, which is what makes it usable with a keyboard or
 * a screen reader.
 */
export function MobileNav({
  links,
  telephone,
  telHref,
  cta,
}: {
  links: NavLink[]
  telephone?: string
  telHref?: string
  cta?: NavLink | null
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Any navigation closes the panel, including browser back/forward.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-50 lg:hidden"
      >
        <Icon name="menu" className="size-6" />
        <span className="sr-only">Open the menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close the menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-navy-950/50"
          />
          <div
            ref={panelRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-raised"
          >
            <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
              <span className="font-display text-lg font-semibold text-navy-900">Menu</span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className="rounded-lg p-2 text-navy-800 hover:bg-navy-50"
              >
                <Icon name="close" className="size-6" />
                <span className="sr-only">Close the menu</span>
              </button>
            </div>

            <nav className="flex-1 px-3 py-4">
              <ul className="space-y-1">
                {links.map((link) => {
                  const current = pathname === link.href
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={current ? 'page' : undefined}
                        className={cn(
                          'block rounded-lg px-3 py-3 text-lg font-medium',
                          current
                            ? 'bg-navy-50 text-navy-900'
                            : 'text-ink-800 hover:bg-ink-50',
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-ink-200 px-5 py-5">
              {cta ? (
                <Link
                  href={cta.href}
                  className="flex w-full items-center justify-center rounded-lg bg-navy-700 px-5 py-3.5 font-semibold text-white"
                >
                  {cta.label}
                </Link>
              ) : null}
              {telephone && telHref ? (
                <a
                  href={telHref}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-navy-200 px-5 py-3.5 font-semibold text-navy-800"
                >
                  <Icon name="phone" />
                  Call {telephone}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
