'use client'

import React, { useEffect } from 'react'

const INTERACTIVE = 'button, input, textarea, select, label, a[href]'

/**
 * Payload only links the first column of a list. A CSS overlay used to stretch
 * that link across the row; on iPhone the overlay sat on a page-sized
 * containing block and swallowed taps without navigating. Follow the document
 * link from a tap on the rest of the row instead.
 */
export function ListRowClick({ children }: { children?: React.ReactNode }) {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0) return
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const target = event.target
      if (!(target instanceof Element)) return
      if (target.closest('.cell-_select, .cell-_dragHandle')) return

      const row = target.closest('.table tbody tr')
      if (!(row instanceof HTMLElement)) return

      const link = row.querySelector<HTMLAnchorElement>('a[href*="/collections/"]')
      if (!link) return

      const interactive = target.closest(INTERACTIVE)
      if (interactive instanceof HTMLAnchorElement && interactive === link) return
      if (interactive && interactive !== link) return

      event.preventDefault()
      window.location.assign(link.href)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return children
}
