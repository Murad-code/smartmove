'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

export interface NavLink {
  label: string
  href: string
}

/** Must match `--animate-panel-out` in globals.css. */
const MENU_EXIT_MS = 160

/**
 * Mobile navigation.
 *
 * The only interactive client component in the header, so the rest of the
 * chrome stays on the server. Focus is moved into the panel on open and the
 * page behind it is locked, which is what makes it usable with a keyboard or
 * a screen reader.
 *
 * The panel is portalled to `document.body`. The header sets `backdrop-blur`,
 * and `backdrop-filter` makes an element the containing block for fixed
 * descendants, so an overlay rendered in place is trapped inside the header's
 * 72px strip instead of covering the viewport.
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
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // The panel remembers which page it was opened on. Navigating anywhere,
  // including with the browser's back button, makes this stale and the panel
  // closes on its own, with no effect synchronising two pieces of state.
  const [openedFor, setOpenedFor] = useState<string | null>(null)
  const open = openedFor === pathname

  // Held open for the length of the exit animation, then unmounted.
  const [closing, setClosing] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const setOpen = useCallback((next: boolean) => setOpenedFor(next ? pathname : null), [pathname])

  /**
   * Close on a timer rather than on `animationend`.
   *
   * If the animation never runs, an `animationend` listener never fires and
   * the menu is stuck open with the page behind it locked. A timer always
   * resolves, so the worst case is a slightly early unmount.
   */
  const requestClose = useCallback(
    ({ returnFocus = false } = {}) => {
      const instant =
        typeof window === 'undefined' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const finish = () => {
        setClosing(false)
        setOpen(false)
        if (returnFocus) triggerRef.current?.focus()
      }

      if (instant) {
        finish()
        return
      }

      setClosing(true)
      closeTimer.current = window.setTimeout(finish, MENU_EXIT_MS)
    },
    [setOpen],
  )

  useEffect(() => () => window.clearTimeout(closeTimer.current ?? undefined), [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') requestClose({ returnFocus: true })
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, requestClose])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50 active:bg-navy-100 lg:hidden"
      >
        {/* Three bars rather than the menu glyph, so they can react to a
            press. There is no hover on a phone, so `active` is the state that
            actually gets seen: the bars draw together and the middle one
            shortens, which reads as the button acknowledging the tap. */}
        <span
          aria-hidden="true"
          className="flex size-6 flex-col items-center justify-center gap-[5px]"
        >
          <span className="h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:translate-y-[3px]" />
          <span className="h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out group-hover:w-3.5 group-active:w-2.5" />
          <span className="h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out group-hover:translate-y-0.5 group-active:-translate-y-[3px]" />
        </span>
        <span className="sr-only">Open the menu</span>
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-50 lg:hidden">
              <button
                type="button"
                aria-label="Close the menu"
                onClick={() => requestClose()}
                className={cn(
                  'absolute inset-0 h-full w-full cursor-default bg-navy-950/50',
                  closing ? 'animate-fade-out' : 'animate-fade-in',
                )}
              />
              <div
                ref={panelRef}
                id="mobile-navigation"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                tabIndex={-1}
                // Keeps the smooth-scrolling wrapper out of this panel's own
                // overflow, so a long menu scrolls natively instead of
                // dragging the page behind it.
                data-lenis-prevent
                className={cn(
                  'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-raised',
                  closing ? 'animate-panel-out' : 'animate-panel-in',
                )}
              >
                <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
                  <span className="font-display text-lg font-semibold text-navy-900">Menu</span>
                  <button
                    type="button"
                    onClick={() => requestClose({ returnFocus: true })}
                    className="rounded-lg p-2 text-navy-800 transition-colors hover:bg-navy-50 active:bg-navy-100"
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
                              current ? 'bg-navy-50 text-navy-900' : 'text-ink-800 hover:bg-ink-50',
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
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
