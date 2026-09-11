/**
 * Playwright marks every request with this header so a reused `pnpm dev`
 * (which may have EMAIL_PROVIDER=resend in `.env`) still writes enquiry
 * notifications to the console instead of spending the sending quota.
 *
 * Production ignores the header. It must never be a way to silence mail
 * on a live site.
 */
export const E2E_EMAIL_HEADER = 'x-smartmove-e2e'
export const E2E_EMAIL_HEADER_VALUE = '1'

export function shouldUseConsoleEmail(
  isProduction: boolean,
  e2eHeader: string | null | undefined,
): boolean {
  return !isProduction && e2eHeader === E2E_EMAIL_HEADER_VALUE
}
