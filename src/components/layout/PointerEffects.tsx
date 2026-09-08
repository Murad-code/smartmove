'use client'

import { useEffect, useRef } from 'react'

/**
 * Decorative pointer behaviour: the cursor ring, and the tilt on cards.
 *
 * Both are desktop-only garnish. They are separated from `Motion` because
 * nothing here has anything to do with content arriving, and because
 * everything here is safe to delete if the client ever finds it fussy.
 *
 * Listeners are delegated to the document rather than bound per card, so a
 * route change needs no rescan.
 */

/** How much of the remaining distance the ring closes each frame. */
const RING_LERP = 0.16

/** Below this the ring has arrived and the animation loop can stop. */
const RING_SETTLED_PX = 0.15

/** Milder than the reference's 6/8 degrees, which tips far enough to distort. */
const TILT_X_DEG = 3.5
const TILT_Y_DEG = 5

const GROW_OVER = 'a, button, .lift-card'

export function PointerEffects() {
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ring.current
    if (!el) return
    if (document.documentElement.dataset.motion !== 'on') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let targetX = -100
    let targetY = -100
    let x = -100
    let y = -100
    let frame = 0

    const step = () => {
      x += (targetX - x) * RING_LERP
      y += (targetY - y) * RING_LERP
      el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`

      // Idling a requestAnimationFrame loop for the life of the page costs
      // battery for nothing. It stops once the ring has caught up and the next
      // pointer move starts it again.
      if (Math.hypot(targetX - x, targetY - y) < RING_SETTLED_PX) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(step)
    }

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      el.dataset.on = ''
      if (!frame) frame = requestAnimationFrame(step)
    }

    const onLeave = () => delete el.dataset.on

    const onOver = (event: MouseEvent) => {
      const over = event.target instanceof Element && event.target.closest(GROW_OVER)
      if (over) el.dataset.grow = ''
      else delete el.dataset.grow
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  useEffect(() => {
    if (document.documentElement.dataset.motion !== 'on') return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let tilted: HTMLElement | null = null

    const reset = () => {
      if (!tilted) return
      tilted.style.removeProperty('--tilt-x')
      tilted.style.removeProperty('--tilt-y')
      tilted = null
    }

    const onMove = (event: MouseEvent) => {
      const card =
        event.target instanceof Element ? event.target.closest<HTMLElement>('.lift-card') : null

      if (card !== tilted) reset()
      if (!card) return

      const box = card.getBoundingClientRect()
      const fromCentreX = (event.clientX - box.left) / box.width - 0.5
      const fromCentreY = (event.clientY - box.top) / box.height - 0.5

      tilted = card
      // Inverted on the X axis: pushing the top of the card away from you is
      // what reads as depth rather than as a wobble.
      card.style.setProperty('--tilt-x', `${(-fromCentreY * TILT_X_DEG).toFixed(2)}deg`)
      card.style.setProperty('--tilt-y', `${(fromCentreX * TILT_Y_DEG).toFixed(2)}deg`)
    }

    document.addEventListener('mousemove', onMove)
    return () => {
      document.removeEventListener('mousemove', onMove)
      reset()
    }
  }, [])

  // Rendered unconditionally so there is nothing for the server and the client
  // to disagree about; the CSS hides it on touch devices and the effects above
  // never start when they are unwelcome.
  return <div ref={ring} className="cursor-ring" aria-hidden="true" />
}
