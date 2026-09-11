'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * The site's one motion observer.
 *
 * Mounted once in the frontend layout. It works entirely off class names and
 * data attributes in the markup, never props, so a server component opts into
 * a reveal by rendering `className="reveal"` and stays a server component.
 * Nothing in `src/components/ui` or `src/blocks` needs `'use client'` for any
 * of this, and it should stay that way.
 *
 * Anything scroll-*linked* belongs in CSS instead. See docs/motion.md for
 * which mechanism to reach for.
 */

const REVEAL_SELECTOR = '.reveal, .reveal-group'

/** Gap between children of a `.reveal-group`, matching the reference build. */
const STAGGER_MS = 110

const COUNT_MS = 1800

/**
 * Past this the header has stopped being a landing-page banner and starts
 * being a toolbar, so it shrinks and solidifies.
 */
const SHRINK_PX = 40

function armStagger(group: Element) {
  Array.from(group.children).forEach((child, index) => {
    if (child instanceof HTMLElement) {
      child.style.transitionDelay = `${index * STAGGER_MS}ms`
    }
  })
}

function runCounter(el: HTMLElement) {
  const target = Number(el.dataset.countTo)
  if (!Number.isFinite(target)) return

  const prefix = el.dataset.countPrefix ?? ''
  const suffix = el.dataset.countSuffix ?? ''
  // Counting "69.99" as an integer and only landing on the decimals at the
  // very end looks like a bug, so the number of places is fixed throughout.
  const places = (el.dataset.countTo ?? '').split('.')[1]?.length ?? 0

  let start: number | null = null

  const frame = (now: number) => {
    start ??= now
    const progress = Math.min((now - start) / COUNT_MS, 1)
    // Cubic ease-out, the clock-driven cousin of `--ease-smooth`.
    const eased = 1 - Math.pow(1 - progress, 3)
    el.textContent = `${prefix}${(target * eased).toFixed(places)}${suffix}`
    if (progress < 1) requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)
}

export function Motion() {
  // Route changes swap the whole page body, so the new markup needs observing.
  const pathname = usePathname()

  useEffect(() => {
    // The layout's inline script sets this before first paint, and only when
    // motion is welcome. If it is absent the markup is already in its final
    // state and there is nothing for us to reveal.
    if (document.documentElement.dataset.motion !== 'on') return

    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('revealed')
          // One-shot. Re-animating on the way back up reads as a glitch.
          reveals.unobserve(entry.target)
        }
      },
      // Default root, no inset. A ratio threshold would miss a section taller
      // than the viewport; a bottom inset would miss copy that is already on
      // screen under a tall photo header. A single pixel in the viewport is
      // enough: the visitor can see it, so it must not wait for a scroll.
    )

    const counters = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          runCounter(entry.target as HTMLElement)
          counters.unobserve(entry.target)
        }
      },
      { threshold: 0.5 },
    )

    document.querySelectorAll('.reveal-group').forEach(armStagger)
    document.querySelectorAll(REVEAL_SELECTOR).forEach((el) => {
      const box = el.getBoundingClientRect()
      if (box.bottom > 0 && box.top < window.innerHeight) {
        el.classList.add('revealed')
        return
      }
      reveals.observe(el)
    })
    document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
      counters.observe(el)
    })

    return () => {
      reveals.disconnect()
      counters.disconnect()
    }
  }, [pathname])

  // Deliberately a class toggle rather than a scroll-driven animation: the
  // shrink changes `height`, and a scroll timeline would re-run layout on
  // every frame of every scroll. Toggling lays out once and lets the CSS
  // transition carry it. Runs for everyone, including reduced motion, because
  // the transition duration is clamped there rather than the state change.
  useEffect(() => {
    const root = document.documentElement
    let queued = false

    const sync = () => {
      queued = false
      if (window.scrollY > SHRINK_PX) root.dataset.scrolled = ''
      else delete root.dataset.scrolled
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return null
}
