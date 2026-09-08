import React from 'react'

import { Icon } from '@/components/ui/Icon'

/**
 * Appears once you are well down the page.
 *
 * A plain anchor rather than a button with a click handler, so it needs no
 * JavaScript: Lenis picks up same-page anchors and scrolls smoothly, and
 * without Lenis the browser jumps, which is also correct. Its visibility comes
 * from a CSS scroll-driven animation, so there is no scroll listener either.
 *
 * `#top` is an empty target at the very start of the body. Anchoring to `main`
 * instead would land a little way down, because the header sits above it in
 * normal flow.
 */
export function BackToTop() {
  return (
    <a
      href="#top"
      className="back-to-top fixed right-5 bottom-5 z-50 grid size-11 place-items-center rounded-full bg-navy-900 text-white shadow-raised transition-colors duration-200 hover:bg-navy-700"
    >
      <Icon name="chevron-left" className="size-5 rotate-90" />
      <span className="sr-only">Back to top</span>
    </a>
  )
}
