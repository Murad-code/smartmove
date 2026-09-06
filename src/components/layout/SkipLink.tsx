import React from 'react'

/** Visible only on keyboard focus, so mouse users never see it. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-navy-700 focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
    >
      Skip to the main content
    </a>
  )
}
