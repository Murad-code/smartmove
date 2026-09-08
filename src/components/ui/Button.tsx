import Link from 'next/link'
import React from 'react'

import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'inverse'
type Size = 'default' | 'small' | 'large'

// `sheen` adds the gradient sweep and the trailing-icon nudge from
// globals.css; `--sheen` below sets its colour per variant, because a white
// sweep is invisible on a white button. A hover here moves three things at
// once on the shared curve, which is what stops it feeling like a colour swap.
const BASE =
  'sheen inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-navy-700 text-white hover:bg-navy-800 hover:-translate-y-0.5 hover:shadow-raised [--sheen:rgb(255_255_255/0.3)]',
  secondary:
    'border border-navy-200 bg-white text-navy-800 hover:border-navy-400 hover:bg-navy-50 hover:-translate-y-0.5 hover:shadow-card [--sheen:rgb(0_61_126/0.08)]',
  // The brand green is too light to carry white text at AA, so it carries
  // dark navy text instead. That keeps the brand colour and reaches 9:1.
  accent:
    'bg-accent-400 text-navy-950 hover:bg-accent-300 hover:-translate-y-0.5 hover:shadow-raised [--sheen:rgb(255_255_255/0.45)]',
  // No sweep and no lift: a ghost button has no surface for either to read
  // against, and it is used inline where a lift would nudge the text around it.
  ghost: 'text-navy-700 hover:bg-navy-50',
  // For use on navy sections, where the primary navy button would vanish.
  inverse:
    'bg-white text-navy-800 hover:bg-navy-50 hover:-translate-y-0.5 hover:shadow-raised [--sheen:rgb(0_61_126/0.08)]',
}

const SIZES: Record<Size, string> = {
  small: 'px-3.5 py-2 text-sm',
  // 44px tall, which keeps every button a comfortable touch target.
  default: 'px-5 py-2.5 text-[0.95rem]',
  large: 'px-7 py-3.5 text-base',
}

function classes(variant: Variant, size: Size, fullWidth?: boolean, className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && 'w-full', className)
}

export function Button({
  variant = 'primary',
  size = 'default',
  fullWidth,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}) {
  return <button className={classes(variant, size, fullWidth, className)} {...props} />
}

/**
 * A link styled as a button. Uses `next/link` for in-app paths and a plain
 * anchor for anything external, `tel:` or `mailto:`.
 */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'default',
  fullWidth,
  className,
  children,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: React.ReactNode
}) {
  const isInternal = href.startsWith('/') && !href.startsWith('//')
  const merged = classes(variant, size, fullWidth, className)

  if (isInternal) {
    return (
      <Link href={href} className={merged} {...props}>
        {children}
      </Link>
    )
  }

  const isExternal = /^https?:\/\//.test(href)

  return (
    <a
      href={href}
      className={merged}
      {...(isExternal ? { rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  )
}
