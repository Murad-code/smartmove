import React from 'react'

import { cn } from '@/lib/cn'
import type { PropertyStatus } from '@/lib/properties/types'

type Tone = 'available' | 'let-agreed' | 'neutral' | 'accent'

const TONES: Record<Tone, string> = {
  // accent-700 on accent-50 clears AA; the brighter brand green does not.
  available: 'bg-accent-50 text-accent-800 ring-accent-200',
  'let-agreed': 'bg-amber-50 text-amber-900 ring-amber-200',
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200',
  accent: 'bg-navy-50 text-navy-800 ring-navy-200',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_TONE: Partial<Record<PropertyStatus, Tone>> = {
  available: 'available',
  'let-agreed': 'let-agreed',
}

const STATUS_LABEL: Partial<Record<PropertyStatus, string>> = {
  available: 'Available',
  'let-agreed': 'Let agreed',
}

/** Renders nothing for statuses that are never shown publicly. */
export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const tone = STATUS_TONE[status]
  if (!tone) return null
  return <Badge tone={tone}>{STATUS_LABEL[status]}</Badge>
}
