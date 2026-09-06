import { logger } from '@/lib/logger'
import { env } from '@/lib/env'

/**
 * Spam defences, cheapest first.
 *
 * 1. Honeypot — a hidden field only a bot fills in.
 * 2. Timing — a form completed in under two seconds was not typed by a person.
 * 3. Rate limit — a cap per client, per form.
 * 4. Turnstile — only when both keys are configured.
 *
 * Rejections look like an ordinary validation failure to the caller so a bot
 * learns nothing about which check caught it.
 */

const MINIMUM_FILL_MS = 2_000
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5

interface Bucket {
  count: number
  resetAt: number
}

/**
 * In-memory rate limiting. Correct for the single-container deployment this
 * app ships with; running more than one instance would need shared storage,
 * which is noted in docs/operations.md.
 */
const buckets = new Map<string, Bucket>()

function sweep(now: number) {
  if (buckets.size < 500) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  bucket.count += 1
  return bucket.count <= MAX_PER_WINDOW
}

/** Exposed so tests can start from a clean slate. */
export function resetRateLimits() {
  buckets.clear()
}

export function isHoneypotTripped(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

export function isTooFast(renderedAt: unknown): boolean {
  if (typeof renderedAt !== 'string') return false
  const timestamp = Number.parseInt(renderedAt, 10)
  if (!Number.isFinite(timestamp)) return false
  return Date.now() - timestamp < MINIMUM_FILL_MS
}

export async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (!env.turnstile.enabled) return true
  if (typeof token !== 'string' || !token) return false

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.turnstile.secretKey, response: token }),
      signal: AbortSignal.timeout(8_000),
    })
    const result = (await response.json()) as { success?: boolean }
    return Boolean(result.success)
  } catch (error) {
    logger.error('Turnstile verification failed', error)
    // Failing open keeps genuine enquiries flowing if Cloudflare is down; the
    // honeypot, timing and rate limits are still in force.
    return true
  }
}
