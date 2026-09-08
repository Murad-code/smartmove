import React from 'react'

/**
 * A slowly looping strip of short phrases.
 *
 * Sits directly under the hero, where it does two jobs: it says what the
 * business actually does in the first screenful, and its movement pulls the
 * eye past the fold.
 *
 * Feed it CMS-authored text only. It is a claims strip in a prominent place,
 * so it is not somewhere to put anything about accreditations, redress
 * schemes or fees that has not been confirmed by the client.
 */
export function Marquee({ items }: { items: string[] }) {
  // Too few and the loop is visibly a loop rather than a strip.
  if (items.length < 3) return null

  return (
    <div className="marquee border-y border-white/10 bg-navy-950 py-5">
      {/* Rendered twice, and the track slides by exactly half its own width:
          that is what makes the seam invisible. The second copy is hidden from
          assistive technology so the strip is announced once. */}
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0" aria-hidden={copy === 1 || undefined}>
            {items.map((item) => (
              <li
                key={item}
                className="flex shrink-0 items-center gap-6 px-6 text-sm font-semibold tracking-[0.2em] text-white/70 uppercase"
              >
                {item}
                <span aria-hidden="true" className="size-1.5 rounded-full bg-accent-400" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
