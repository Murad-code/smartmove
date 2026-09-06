import React from 'react'

import { cn } from '@/lib/cn'

/** Horizontal rhythm for the whole site. Nothing sets its own page padding. */
export function Container({
  children,
  className,
  size = 'default',
  as: Tag = 'div',
}: {
  children: React.ReactNode
  className?: string
  size?: 'default' | 'narrow' | 'wide'
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article'
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-5 sm:px-6 lg:px-8',
        size === 'narrow' && 'max-w-3xl',
        size === 'default' && 'max-w-7xl',
        size === 'wide' && 'max-w-[90rem]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}
