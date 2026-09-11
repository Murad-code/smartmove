'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { setProgrammaticScroll } from '@/lib/programmatic-scroll'

import 'lenis/dist/lenis.css'

/**
 * Smoothed wheel scrolling.
 *
 * This is the thing you notice first on a site like this and can least easily
 * name. It is also the one piece of the motion system that takes over a
 * browser default, so it is fenced in carefully. See docs/motion.md.
 *
 * Deliberately not applied to touch: mobile momentum scrolling is already good
 * and interfering with it feels broken. Lenis leaves touch alone by default,
 * so `syncTouch` stays off.
 *
 * Nested scrolling areas opt out with `data-lenis-prevent` on the element, as
 * the mobile navigation panel does. Lenis can also detect them automatically,
 * but that guesses from computed `overflow` and would happily mistake a
 * collapsed `overflow: hidden` region such as the header's contact strip for
 * something the visitor meant to scroll.
 */

/** Matches the reference build. Lower is looser; much lower feels seasick. */
const LERP = 0.09

/** Clears the sticky header when an anchor link lands on a section. */
const ANCHOR_OFFSET = -96

export function SmoothScroll() {
  const pathname = usePathname()
  const lenis = useRef<Lenis | null>(null)
  const navigated = useRef(false)

  useEffect(() => {
    // Hijacking the scroll is precisely what this setting is asking us not to
    // do, so there is no reduced-motion variant of this component: it either
    // runs or the browser scrolls natively.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    // `scroll-behavior: smooth` in globals.css and Lenis both want to own
    // programmatic scrolling, and the two together stutter.
    const previousBehaviour = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'

    const instance = new Lenis({
      lerp: LERP,
      wheelMultiplier: 1.05,
      autoRaf: true,
      // Lenis 1.3 handles same-page anchors itself, which saves reimplementing
      // focus handling and history for `/#services`-style links.
      anchors: { offset: ANCHOR_OFFSET },
    })
    lenis.current = instance
    setProgrammaticScroll((node) => {
      instance.scrollTo(node, { offset: ANCHOR_OFFSET, immediate: true, force: true })
    })

    // Anything that opens a full-screen overlay locks the page by setting
    // `overflow` on the body. Watching for that keeps Lenis out of the
    // business of knowing which components those are: the mobile navigation
    // does not have to import anything from here, and neither will the next
    // overlay somebody adds.
    const lock = new MutationObserver(() => {
      if (document.body.style.overflow === 'hidden') instance.stop()
      else instance.start()
    })
    lock.observe(document.body, { attributes: true, attributeFilter: ['style'] })

    return () => {
      lock.disconnect()
      instance.destroy()
      lenis.current = null
      setProgrammaticScroll(null)
      root.style.scrollBehavior = previousBehaviour
    }
  }, [])

  // Next resets the scroll position on navigation by calling `window.scrollTo`,
  // which Lenis has taken over, so a route change would otherwise open the new
  // page at the old page's offset.
  //
  // Only on an actual navigation, though. This effect also runs on first
  // mount, and jumping to the top there would undo the position the browser
  // restored on a reload, and overrule anyone who started scrolling before
  // hydration finished. Skipped for a URL with a hash too, where the top of
  // the page is the wrong answer.
  useEffect(() => {
    if (!navigated.current) {
      navigated.current = true
      return
    }
    if (!lenis.current) return
    if (window.location.hash) return
    lenis.current.scrollTo(0, { immediate: true, force: true })
  }, [pathname])

  return null
}
