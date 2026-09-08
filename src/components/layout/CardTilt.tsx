'use client'

import { useEffect } from 'react'

/**
 * Tips a card slightly towards the cursor.
 *
 * Desktop garnish, and the only pointer effect on the site. It is separate from
 * `Motion` because it has nothing to do with content arriving, and because it
 * is safe to delete outright if the client ever finds it fussy.
 *
 * The listener is delegated to the document rather than bound per card, so a
 * route change needs no rescan.
 */

/** Milder than the reference's 6/8 degrees, which tips far enough to distort. */
const TILT_X_DEG = 3.5
const TILT_Y_DEG = 5

export function CardTilt() {
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

  return null
}
