import React from 'react'

import { cn } from '@/lib/cn'

type Tone = 'success' | 'error' | 'info'

const TONES: Record<Tone, string> = {
  success: 'border-accent-300 bg-accent-50 text-accent-900',
  error: 'border-red-300 bg-red-50 text-red-900',
  info: 'border-navy-200 bg-navy-50 text-navy-900',
}

/**
 * `role="status"` for good news, `role="alert"` for failures, so screen
 * readers interrupt only when something has actually gone wrong.
 */
export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone
  title?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border px-4 py-3.5 text-sm', TONES[tone], className)}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && 'mt-1')}>{children}</div> : null}
    </div>
  )
}
