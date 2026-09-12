'use client'

import React, { useEffect } from 'react'

const INTERACTIVE = 'a, button, input, textarea, select, label'

/**
 * Payload only links the first column of a list. CSS stretches that link
 * across the row, but on a phone the overlay is not a tap target: WebKit
 * will not use a table-row as the containing block, and iOS ignores taps on
 * an empty pseudo-element. Listen for a tap on the rest of the row and
 * follow the document link ourselves.
 */
export function ListRowClick({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest(INTERACTIVE)) return
      if (target.closest('.cell-_select, .cell-_dragHandle')) return

      const row = target.closest('.table tbody tr')
      if (!(row instanceof HTMLElement)) return

      const link = row.querySelector<HTMLAnchorElement>('a[href*="/collections/"]')
      if (!link) return

      event.preventDefault()
      link.click()
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return children
}
