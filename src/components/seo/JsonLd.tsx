import React from 'react'

/**
 * Emits a JSON-LD block.
 *
 * The payload is serialised with `<` escaped so a stray angle bracket in CMS
 * copy cannot close the script tag early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
