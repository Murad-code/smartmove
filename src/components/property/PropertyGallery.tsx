'use client'

import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { PropertyImage } from '@/lib/properties/types'

function snapScrollLeft(scroller: HTMLElement, index: number): number {
  const slide = scroller.children[index] as HTMLElement | undefined
  if (!slide) return 0
  const max = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
  if (index <= 0) return 0
  if (index >= scroller.children.length - 1) return max
  const centered = slide.offsetLeft - (scroller.clientWidth - slide.clientWidth) / 2
  return Math.min(max, Math.max(0, centered))
}

function nearestSlideIndex(scroller: HTMLElement): number {
  let best = 0
  let bestDist = Infinity
  for (let i = 0; i < scroller.children.length; i += 1) {
    const dist = Math.abs(scroller.scrollLeft - snapScrollLeft(scroller, i))
    if (dist < bestDist) {
      bestDist = dist
      best = i
    }
  }
  return best
}

/**
 * Property gallery.
 *
 * The main photos are a native horizontally scrolling snap list, so a swipe
 * on a phone (or a mouse drag on a desktop) moves between them without a
 * carousel library. On a phone the next photo peeks into the frame, which is
 * both the affordance and what shortens the swipe. Arrows (from `sm` up) and
 * the thumbnail strip stay for people who prefer to tap.
 */
export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [dragging, setDragging] = useState(false)
  const scrollerRef = useRef<HTMLUListElement>(null)
  const dragRef = useRef<{ pointerId: number; startX: number; startScroll: number } | null>(null)

  const goTo = useCallback((next: number, behavior: ScrollBehavior = 'smooth') => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scroller.scrollTo({
      left: snapScrollLeft(scroller, next),
      behavior: reduceMotion ? 'auto' : behavior,
    })
    setIndex(next)
  }, [])

  const step = useCallback(
    (delta: number) => {
      goTo((index + delta + images.length) % images.length)
    },
    [goTo, images.length, index],
  )

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || images.length < 2) return

    const sync = () => {
      const next = nearestSlideIndex(scroller)
      setIndex((current) => (next === current ? current : next))
    }

    scroller.addEventListener('scroll', sync, { passive: true })
    return () => scroller.removeEventListener('scroll', sync)
  }, [images.length])

  if (!images.length) {
    return (
      <div className="grid aspect-[16/10] place-items-center rounded-card bg-ink-100 text-ink-400">
        <div className="text-center">
          <Icon name="house" className="mx-auto size-12" />
          <p className="mt-2 text-sm">Photographs coming soon</p>
        </div>
      </div>
    )
  }

  const canBrowse = images.length > 1

  return (
    <div
      onKeyDown={(event) => {
        if (!canBrowse) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          step(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          step(1)
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-ink-100 sm:aspect-[16/10]">
        <ul
          ref={scrollerRef}
          data-lenis-prevent
          aria-label={`${title} photographs`}
          onPointerDown={(event) => {
            if (!canBrowse || event.pointerType !== 'mouse' || event.button !== 0) return
            if ((event.target as HTMLElement).closest('button')) return
            const scroller = scrollerRef.current
            if (!scroller) return
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startScroll: scroller.scrollLeft,
            }
            scroller.setPointerCapture(event.pointerId)
            setDragging(true)
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current
            const scroller = scrollerRef.current
            if (!drag || drag.pointerId !== event.pointerId || !scroller) return
            scroller.scrollLeft = drag.startScroll - (event.clientX - drag.startX)
          }}
          onPointerUp={(event) => {
            if (dragRef.current?.pointerId !== event.pointerId) return
            dragRef.current = null
            setDragging(false)
            const scroller = scrollerRef.current
            if (!scroller) return
            goTo(nearestSlideIndex(scroller))
          }}
          onPointerCancel={() => {
            dragRef.current = null
            setDragging(false)
          }}
          className={cn(
            'rail absolute inset-0 flex overflow-x-auto overscroll-x-contain touch-pan-x select-none',
            canBrowse ? 'gap-3 sm:gap-0' : null,
            dragging ? 'snap-none cursor-grabbing' : 'snap-x snap-mandatory',
            canBrowse && !dragging ? 'cursor-grab' : null,
          )}
        >
          {images.map((image, position) => (
            <li
              key={image.id}
              className={cn(
                'relative h-full shrink-0',
                // A sliver of the next photo on a phone, so a swipe has
                // somewhere to go and does not have to cover half the frame.
                canBrowse ? 'w-[calc(100%-3rem)] snap-always sm:w-full' : 'w-full',
                !canBrowse || position === 0
                  ? 'snap-start'
                  : position === images.length - 1
                    ? 'snap-end sm:snap-start'
                    : 'snap-center sm:snap-start',
              )}
            >
              <Image
                src={image.wideUrl ?? image.url}
                alt={image.alt || title}
                fill
                priority={position === 0}
                draggable={false}
                sizes="(min-width: 1024px) 65vw, 100vw"
                className="pointer-events-none object-cover"
              />
            </li>
          ))}
        </ul>

        {canBrowse ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 shadow-card hover:bg-white sm:grid"
            >
              <Icon name="chevron-left" />
              <span className="sr-only">Previous photo</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 shadow-card hover:bg-white sm:grid"
            >
              <Icon name="chevron-right" />
              <span className="sr-only">Next photo</span>
            </button>
            <p className="absolute right-3 bottom-3 z-10 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-medium text-white">
              <span aria-live="polite">
                Photo {index + 1} of {images.length}
              </span>
            </p>
          </>
        ) : null}
      </div>

      {canBrowse ? (
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, position) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => goTo(position)}
                aria-current={position === index ? 'true' : undefined}
                className={cn(
                  'relative block h-16 w-24 overflow-hidden rounded-lg ring-2 transition-opacity sm:h-20 sm:w-28',
                  position === index
                    ? 'ring-navy-700'
                    : 'opacity-70 ring-transparent hover:opacity-100',
                )}
              >
                <Image
                  src={image.thumbnailUrl ?? image.url}
                  alt=""
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <span className="sr-only">Show photo {position + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
