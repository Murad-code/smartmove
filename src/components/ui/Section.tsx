import React from 'react'

import { cn } from '@/lib/cn'

import { Container } from './Container'

export type SectionBackground = 'white' | 'grey' | 'navy' | 'navy-soft'

const BACKGROUNDS: Record<SectionBackground, string> = {
  white: 'bg-white',
  grey: 'bg-ink-50',
  navy: 'bg-navy-900 text-navy-100',
  'navy-soft': 'bg-navy-50',
}

/** A full-width band of colour with consistent vertical rhythm. */
export function Section({
  children,
  background = 'white',
  className,
  containerSize,
  id,
  spacing = 'default',
}: {
  children: React.ReactNode
  background?: SectionBackground
  className?: string
  containerSize?: 'default' | 'narrow' | 'wide'
  id?: string
  spacing?: 'default' | 'tight' | 'loose'
}) {
  return (
    <section
      id={id}
      className={cn(
        BACKGROUNDS[background],
        spacing === 'tight' && 'py-10 sm:py-14',
        spacing === 'default' && 'py-14 sm:py-20',
        spacing === 'loose' && 'py-20 sm:py-28',
        className,
      )}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  )
}

/** Heading plus optional intro, centred or left aligned. */
export function SectionHeading({
  eyebrow,
  heading,
  intro,
  align = 'left',
  tone = 'dark',
  as: Tag = 'h2',
}: {
  eyebrow?: string | null
  heading: string
  intro?: string | null
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'mb-3 text-sm font-semibold tracking-wider uppercase',
            tone === 'light' ? 'text-accent-300' : 'text-accent-700',
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <Tag
        className={cn(
          'text-3xl sm:text-4xl',
          tone === 'light' && 'text-white',
        )}
      >
        {heading}
      </Tag>
      {intro ? (
        <p
          className={cn(
            'mt-4 text-lg',
            tone === 'light' ? 'text-navy-100' : 'text-ink-600',
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  )
}
