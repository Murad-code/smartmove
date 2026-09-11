const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

export function formatMoney(value: number): string {
  return gbp.format(value)
}

/** "£650 pcm" — the convention every UK letting listing uses. */
export function formatRent(value: number): string {
  return `${formatMoney(value)} pcm`
}

const dayMonthYear = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/London',
})

export function formatDate(value: string | Date | null | undefined): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return dayMonthYear.format(date)
}

/**
 * "From 1 March 2026", or "Available now" for a date in the past.
 * A blank date also means now, which is what the CMS help text promises.
 */
export function formatAvailability(value: string | null | undefined): string {
  if (!value) return 'Available now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Available now'
  if (date.getTime() <= Date.now()) return 'Available now'
  return `From ${formatDate(date)}`
}

export function pluralise(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`
}
