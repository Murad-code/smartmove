'use client'

import { useSyncExternalStore } from 'react'

/**
 * Cookie consent, kept outside React so both the banner and the analytics
 * loader read the same value and update together.
 *
 * Stored in `localStorage` rather than a cookie: rejecting non-essential
 * storage should not itself set a cookie, and the choice never needs to reach
 * the server.
 */

const STORAGE_KEY = 'smartmove-cookie-consent'

export type ConsentValue = 'accepted' | 'rejected'

const listeners = new Set<() => void>()

function read(): ConsentValue | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'accepted' || stored === 'rejected' ? stored : null
  } catch {
    // Private browsing or blocked storage: treat as no decision made.
    return null
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  // Another tab may record a decision too.
  window.addEventListener('storage', listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Nothing we can do; the banner still closes for this page view.
  }
  listeners.forEach((listener) => listener())
}

/**
 * `undefined` while the server renders and on the very first client render,
 * which is what keeps the markup identical on both sides.
 */
export function useConsent(): ConsentValue | null | undefined {
  return useSyncExternalStore(subscribe, read, () => undefined)
}
