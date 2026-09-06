'use client'

import Image from 'next/image'
import React, { useCallback, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/cn'
import type { PropertyImage } from '@/lib/properties/types'

/**
 * Property gallery.
 *
 * A single large image with a thumbnail strip. No carousel library: the strip
 * is a native horizontally scrolling list, which gives momentum scrolling on
 * touch for free and keeps the client bundle to this file.
 */
export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0)

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + images.length) % images.length)
    },
    [images.length],
  )

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

  const active = images[index]

  return (
    <div
      onKeyDown={(event) => {
        if (images.length < 2) return
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
        <Image
          key={active.id}
          src={active.wideUrl ?? active.url}
          alt={active.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 65vw, 100vw"
          className="object-cover"
        />

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 shadow-card hover:bg-white"
            >
              <Icon name="chevron-left" />
              <span className="sr-only">Previous photo</span>
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-navy-800 shadow-card hover:bg-white"
            >
              <Icon name="chevron-right" />
              <span className="sr-only">Next photo</span>
            </button>
            <p className="absolute right-3 bottom-3 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-medium text-white">
              <span aria-live="polite">
                Photo {index + 1} of {images.length}
              </span>
            </p>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-2">
          {images.map((image, position) => (
            <li key={image.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(position)}
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
