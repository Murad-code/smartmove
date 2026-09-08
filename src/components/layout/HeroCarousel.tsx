'use client'

import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'

/**
 * The home page banner.
 *
 * One slide renders as a still hero and costs nothing extra; two or more
 * cross-fade. No carousel library: the slides are stacked in a single grid
 * cell so the band is always as tall as its tallest slide and never jumps
 * as it rotates.
 *
 * Auto-rotation stops on hover, on focus and for anyone who has asked their
 * device to reduce motion, and there is always a visible pause control, which
 * is what WCAG 2.2.2 asks of anything that moves on its own for more than
 * five seconds.
 */

export type HeroCta = { label?: string | null; href?: string | null } | null

export type HeroSlide = {
  id: string
  heading: string
  subheading?: string | null
  imageUrl?: string | null
  primaryCta?: HeroCta
  secondaryCta?: HeroCta
}

/** How long a slide holds before the next one fades in. */
const INTERVAL_MS = 6500

/** Below this the drag reads as a tap rather than a swipe. */
const SWIPE_PX = 50

const HEADING =
  'font-display text-4xl leading-[1.12] font-semibold tracking-[-0.015em] text-balance text-white sm:text-5xl lg:text-[3.5rem]'

function usable(cta: HeroCta): cta is { label: string; href: string } {
  return Boolean(cta?.label && cta?.href)
}

/**
 * The hero is already on screen when the page loads, so its parts arrive on a
 * clock rather than on scroll. The delays are hand-picked rather than evenly
 * spaced: the gap after the heading is the longest, because that is the line
 * the visitor is actually reading.
 */
function rise(delayMs: number): React.CSSProperties {
  return { '--rise-delay': `${delayMs}ms` } as React.CSSProperties
}

export function HeroCarousel({
  slides,
  autoplay = true,
  footer,
}: {
  slides: HeroSlide[]
  autoplay?: boolean
  footer?: React.ReactNode
}) {
  const [index, setIndex] = useState(0)
  const [held, setHeld] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const count = slides.length
  const many = count > 1

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReducedMotion(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  )

  const rotating = many && autoplay && playing && !held && !reducedMotion

  useEffect(() => {
    if (!rotating) return
    const timer = window.setInterval(() => setIndex((c) => (c + 1) % count), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [rotating, count])

  if (!count) return null

  return (
    <section
      className="relative isolate overflow-hidden bg-navy-900"
      aria-roledescription={many ? 'carousel' : undefined}
      aria-label={many ? 'Smart Move highlights' : undefined}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onKeyDown={(event) => {
        if (!many) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          go(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          go(1)
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start === null || !many) return
        const travelled = (event.changedTouches[0]?.clientX ?? start) - start
        if (Math.abs(travelled) > SWIPE_PX) go(travelled < 0 ? 1 : -1)
      }}
    >
      {/* One wrapper around every slide so the scroll-linked push-in is written
          once rather than per slide. The photo inside also drifts on its own
          24-second cycle, which is slow enough that you never catch it moving
          and is the whole reason a still hero stops feeling like a screenshot. */}
      <div aria-hidden="true" className="hero-scrub-bg absolute inset-0">
        {slides.map((slide, position) =>
          slide.imageUrl ? (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-opacity duration-1000 ease-out',
                position === index ? 'opacity-100' : 'opacity-0',
              )}
            >
              <Image
                src={slide.imageUrl}
                alt=""
                fill
                priority={position === 0}
                sizes="100vw"
                className="ken-burns object-cover"
              />
            </div>
          ) : null,
        )}
      </div>

      {/* Dark wash so the heading keeps AA contrast whatever photo is uploaded. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy-950/92 via-navy-950/78 to-navy-950/45"
      />

      {many ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="hero-scrub-content absolute top-1/2 left-4 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-navy-950/40 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/75 lg:grid"
          >
            <Icon name="chevron-left" />
            <span className="sr-only">Previous slide</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="hero-scrub-content absolute top-1/2 right-4 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-navy-950/40 text-white backdrop-blur-sm transition-colors hover:bg-navy-950/75 lg:grid"
          >
            <Icon name="chevron-right" />
            <span className="sr-only">Next slide</span>
          </button>
        </>
      ) : null}

      <Container
        className={cn(
          'hero-scrub-content relative pt-20 sm:pt-28 lg:pt-32',
          !footer && 'pb-20 sm:pb-28 lg:pb-32',
        )}
      >
        <div className="grid" aria-live={rotating ? 'off' : 'polite'}>
          {slides.map((slide, position) => {
            const active = position === index
            // Exactly one h1 on the page whichever slide happens to be showing.
            const Heading = position === 0 ? 'h1' : 'p'

            return (
              <div
                key={slide.id}
                role={many ? 'group' : undefined}
                aria-roledescription={many ? 'slide' : undefined}
                aria-label={many ? `Slide ${position + 1} of ${count}` : undefined}
                aria-hidden={!active}
                inert={!active}
                className={cn(
                  '[grid-area:1/1] max-w-2xl transition-opacity duration-700 ease-out',
                  active ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
              >
                {/* The heading rises from behind its own box rather than
                    fading in. Two elements and one keyframe, and it is the
                    single most effective thing in the motion system. */}
                <Heading className={HEADING}>
                  <span className="rise-mask">
                    <span>{slide.heading}</span>
                  </span>
                </Heading>
                {slide.subheading ? (
                  <p className="rise mt-6 text-lg text-navy-100 sm:text-xl" style={rise(600)}>
                    {slide.subheading}
                  </p>
                ) : null}

                <div className="rise mt-9 flex flex-col gap-3 sm:flex-row" style={rise(750)}>
                  {usable(slide.primaryCta ?? null) ? (
                    <ButtonLink href={slide.primaryCta!.href!} size="large" variant="accent">
                      {slide.primaryCta!.label}
                      <Icon name="arrow-right" className="size-4" />
                    </ButtonLink>
                  ) : null}
                  {usable(slide.secondaryCta ?? null) ? (
                    <ButtonLink href={slide.secondaryCta!.href!} size="large" variant="inverse">
                      {slide.secondaryCta!.label}
                    </ButtonLink>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {many ? (
          <div className="rise mt-8 flex items-center gap-1" style={rise(900)}>
            <ul className="flex items-center gap-1">
              {slides.map((slide, position) => (
                <li key={slide.id}>
                  <button
                    type="button"
                    onClick={() => setIndex(position)}
                    aria-current={position === index ? 'true' : undefined}
                    className="group flex h-11 items-center px-1.5"
                  >
                    <span
                      className={cn(
                        'block h-2 rounded-full transition-all duration-300',
                        position === index
                          ? 'w-9 bg-accent-400'
                          : 'w-2 bg-white/45 group-hover:bg-white/80',
                      )}
                    />
                    <span className="sr-only">Show slide {position + 1}</span>
                  </button>
                </li>
              ))}
            </ul>

            {autoplay ? (
              <button
                type="button"
                onClick={() => setPlaying((current) => !current)}
                className="ml-2 grid size-9 place-items-center rounded-full border border-white/25 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon name={playing ? 'pause' : 'play'} className="size-3.5" />
                <span className="sr-only">
                  {playing ? 'Stop the slides moving' : 'Let the slides move again'}
                </span>
              </button>
            ) : null}
          </div>
        ) : null}

      </Container>

      {/* Outside the heading scrub, so the cards do not fade on scroll. */}
      {footer ? (
        <Container className="relative z-10 pb-20 sm:pb-28 lg:pb-32">{footer}</Container>
      ) : null}
    </section>
  )
}
