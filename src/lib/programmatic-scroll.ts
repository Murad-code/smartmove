/**
 * Scroll a node into view.
 *
 * Lenis takes over `window.scrollTo` on desktop, so a bare `scrollIntoView`
 * after a form collapses can miss. SmoothScroll registers the Lenis path;
 * without it (touch, reduced motion) this falls back to the browser.
 */

type ScrollToNode = (node: HTMLElement) => void

let scrollToNode: ScrollToNode | null = null

export function setProgrammaticScroll(fn: ScrollToNode | null) {
  scrollToNode = fn
}

export function scrollNodeIntoView(node: HTMLElement) {
  if (scrollToNode) {
    scrollToNode(node)
    return
  }

  node.scrollIntoView({ block: 'start', behavior: 'auto' })
}
