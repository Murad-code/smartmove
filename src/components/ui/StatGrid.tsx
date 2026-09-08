import React from 'react'

import { Icon, type IconName } from '@/components/ui/Icon'

/** Decorative only: the owner can reorder figures, so icons cycle by position. */
const STAT_ICONS: IconName[] = ['pound', 'clock', 'people', 'key']

export function StatGrid({
  stats,
}: {
  stats: { id?: string | null; value: string; label: string }[]
}) {
  return (
    <dl className="reveal-group grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.id ?? stat.label}
          className="rounded-card border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
        >
          <span className="grid size-11 place-items-center rounded-lg bg-white/10 text-accent-400">
            <Icon name={STAT_ICONS[index % STAT_ICONS.length] ?? 'pound'} />
          </span>
          <div className="mt-4 flex flex-col-reverse">
            {/* Reversed so the figure reads first while the markup keeps
                the term before its description. */}
            <dt className="mt-1 text-sm text-navy-100">{stat.label}</dt>
            <dd className="font-display text-3xl leading-[1.12] font-semibold tracking-[-0.015em] text-white sm:text-4xl">
              {stat.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  )
}
