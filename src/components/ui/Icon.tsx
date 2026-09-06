import React from 'react'

/**
 * A small hand-rolled icon set.
 *
 * An icon library would add a dependency and a client bundle for what amounts
 * to a dozen paths. All are 24x24 stroke icons so they line up optically.
 */

export type IconName =
  | 'bed'
  | 'bath'
  | 'house'
  | 'key'
  | 'shield'
  | 'spanner'
  | 'chart'
  | 'document'
  | 'people'
  | 'pound'
  | 'phone'
  | 'mail'
  | 'pin'
  | 'clock'
  | 'check'
  | 'arrow-right'
  | 'chevron-left'
  | 'chevron-right'
  | 'menu'
  | 'close'
  | 'car'
  | 'sofa'
  | 'leaf'

const PATHS: Record<IconName, React.ReactNode> = {
  bed: (
    <>
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 18h18M3 14h18M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
      <path d="M6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />
    </>
  ),
  house: (
    <>
      <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="m11 11 9 9M17 17l2-2M14 14l2-2" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6z" />,
  spanner: <path d="M14.5 3a5.5 5.5 0 0 0-5 7.8L3 17.3V21h3.7l6.5-6.5A5.5 5.5 0 1 0 14.5 3z" />,
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z" />
      <path d="M14 3v4h4M9 13h6M9 17h4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.7M18 20a5.6 5.6 0 0 0-2-4.3" />
    </>
  ),
  pound: <path d="M8 20h9M8 20c2-2 2.5-3.4 2.5-6.5S9.6 7 12 5.5c2-1.2 4 .2 4 2M7 13h7" />,
  phone: (
    <path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z" />
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.2l3.2 2" />
    </>
  ),
  check: <path d="m4.5 12.5 5 5 10-11" />,
  'arrow-right': <path d="M4 12h15m-6-6 6 6-6 6" />,
  'chevron-left': <path d="m15 5-7 7 7 7" />,
  'chevron-right': <path d="m9 5 7 7-7 7" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  car: (
    <>
      <path d="M4 16v-3l2-5h12l2 5v3M4 16h16M4 16v2.5M20 16v2.5" />
      <circle cx="7.5" cy="16" r="1.5" />
      <circle cx="16.5" cy="16" r="1.5" />
    </>
  ),
  sofa: (
    <>
      <path d="M4 13V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5" />
      <path d="M3 13h18v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM8 13V9M16 13V9" />
    </>
  ),
  leaf: <path d="M20 4C9 4 4 9 4 16v4M4 16C4 9 11 6 20 4c0 9-4 14-11 14a7 7 0 0 1-5-2" />,
}

export function Icon({
  name,
  className = 'size-5',
  strokeWidth = 1.6,
}: {
  name: IconName
  className?: string
  strokeWidth?: number
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
