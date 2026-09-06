import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { toImage } from '@/lib/properties/mappers'

/**
 * Falls back to a wordmark when no logo has been uploaded, so the site never
 * ships with a broken image while waiting on brand assets from the client.
 */
export function Logo({
  logo,
  companyName,
  tone = 'dark',
}: {
  logo: unknown
  companyName: string
  tone?: 'dark' | 'light'
}) {
  const image = toImage(logo)

  return (
    <Link
      href="/"
      className="inline-flex min-w-0 items-center gap-2.5"
      aria-label={`${companyName} home page`}
    >
      {image ? (
        <Image
          src={image.url}
          alt={image.alt || companyName}
          width={image.width ?? 200}
          height={image.height ?? 56}
          priority
          className="h-10 w-auto sm:h-11"
        />
      ) : (
        <>
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-navy-700 font-display text-lg font-bold text-white"
          >
            S
          </span>
          <span
            className={`truncate font-display text-lg font-semibold tracking-tight sm:text-xl ${
              tone === 'light' ? 'text-white' : 'text-navy-900'
            }`}
          >
            {companyName}
          </span>
        </>
      )}
    </Link>
  )
}
