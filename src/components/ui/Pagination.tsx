import Link from 'next/link'
import React from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * Numbered pagination. Server-rendered links rather than buttons so each page
 * of results is a real, crawlable URL.
 */
export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number
  totalPages: number
  buildHref: (page: number) => string
}) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (candidate) => candidate === 1 || candidate === totalPages || Math.abs(candidate - page) <= 1,
  )

  return (
    <nav aria-label="Property listing pages" className="mt-10">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link
              href={buildHref(page - 1)}
              rel="prev"
              className="inline-flex items-center gap-1 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
            >
              <Icon name="chevron-left" className="size-4" />
              Previous
            </Link>
          ) : null}
        </li>

        {pages.map((candidate, index) => (
          <React.Fragment key={candidate}>
            {index > 0 && candidate - pages[index - 1] > 1 ? (
              <li aria-hidden="true" className="px-1 text-ink-400">
                …
              </li>
            ) : null}
            <li>
              <Link
                href={buildHref(candidate)}
                aria-current={candidate === page ? 'page' : undefined}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-lg border text-sm font-medium',
                  candidate === page
                    ? 'border-navy-700 bg-navy-700 text-white'
                    : 'border-ink-300 text-navy-800 hover:bg-navy-50',
                )}
              >
                {candidate}
                <span className="sr-only"> page</span>
              </Link>
            </li>
          </React.Fragment>
        ))}

        <li>
          {page < totalPages ? (
            <Link
              href={buildHref(page + 1)}
              rel="next"
              className="inline-flex items-center gap-1 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-navy-800 hover:bg-navy-50"
            >
              Next
              <Icon name="chevron-right" className="size-4" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  )
}
