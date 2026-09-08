import React from 'react'

import { Icon, type IconName } from '@/components/ui/Icon'

/** Decorative only: the owner can reorder figures, so icons cycle by position. */
const STAT_ICONS: IconName[] = ['pound', 'clock', 'people', 'key']

/**
 * One number with optional decoration either side: `8%`, `£69.99`, `10+`.
 * Anything else, such as `24/7`, has no single number to count towards and is
 * left exactly as the owner typed it.
 */
const COUNTABLE = /^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/

function countable(value: string) {
  const match = COUNTABLE.exec(value.trim())
  if (!match) return null
  return { to: match[2]!, prefix: match[1] ?? '', suffix: match[3] ?? '' }
}

export function StatGrid({
  stats,
}: {
  stats: { id?: string | null; value: string; label: string }[]
}) {
  return (
    <dl className="reveal-group grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const counter = countable(stat.value)

        return (
          <div
            key={stat.id ?? stat.label}
            className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm transition-[transform,border-color] duration-300 ease-smooth hover:-translate-y-1 hover:border-accent-400/60"
          >
            <span className="grid size-11 place-items-center rounded-lg bg-white/10 text-accent-400">
              <Icon name={STAT_ICONS[index % STAT_ICONS.length] ?? 'pound'} />
            </span>
            <div className="mt-4 flex flex-col-reverse">
              {/* Reversed so the figure reads first while the markup keeps
                the term before its description. */}
              <dt className="mt-1 text-sm text-navy-100">{stat.label}</dt>
              {/* The figure is rendered at its final value, so it is correct
                before any script runs and correct for anyone who has asked for
                less motion. `Motion.tsx` counts it up from zero only when the
                tile scrolls into view. */}
              <dd
                className="counter font-display text-3xl leading-[1.12] font-semibold tracking-[-0.015em] text-white sm:text-4xl"
                {...(counter
                  ? {
                      'data-count-to': counter.to,
                      'data-count-prefix': counter.prefix,
                      'data-count-suffix': counter.suffix,
                    }
                  : {})}
              >
                {stat.value}
              </dd>
            </div>
          </div>
        )
      })}
    </dl>
  )
}
