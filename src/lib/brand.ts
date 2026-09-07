/**
 * Shared branding helpers.
 *
 * Uploaded marks live on Website Settings. These helpers cover the fallbacks
 * used until those files exist, so the header, footer and admin panel do not
 * each invent their own letter.
 */

export function brandInitial(companyName: string): string {
  const letter = companyName.trim().charAt(0)
  return letter ? letter.toUpperCase() : 'S'
}

export function letterMarkSvg(letter: string): string {
  const safe = letter
    .slice(0, 1)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img">
  <rect width="64" height="64" rx="14" fill="#003d7e"/>
  <text x="32" y="43" text-anchor="middle" fill="#ffffff" font-size="32" font-family="system-ui,Segoe UI,sans-serif" font-weight="700">${safe}</text>
</svg>`
}
