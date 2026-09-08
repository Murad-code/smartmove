import { expect, test } from '@playwright/test'

/**
 * The home page banner. Assumes `pnpm seed` has been run, which writes three
 * slides.
 *
 * Every slide is in the DOM at once so the band never changes height, which
 * means Playwright considers all of them "visible": the inactive ones are only
 * transparent. `aria-hidden` is what actually distinguishes them, and it is
 * also what a screen reader goes on, so it is the right thing to assert.
 */

const SLIDES = '[aria-roledescription="slide"]'

test('the banner rotates through slides without leaving more than one h1', async ({ page }) => {
  await page.goto('/')

  const slides = page.locator(SLIDES)
  await expect(slides).toHaveCount(3)

  // Whichever slide is showing, the document has exactly one first-level
  // heading. Only the first slide renders as an h1 for that reason.
  await expect(page.locator('h1')).toHaveCount(1)

  // Stop the timer first, or it can advance mid-assertion.
  await page.getByRole('button', { name: 'Stop the slides moving' }).click()

  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'false')
  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'true')

  await page.getByRole('button', { name: 'Show slide 2' }).click()

  await expect(slides.nth(1)).toHaveAttribute('aria-hidden', 'false')
  await expect(slides.nth(0)).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('h1')).toHaveCount(1)
})

test('the banner can be paused, which WCAG requires of anything that moves on its own', async ({
  page,
}) => {
  await page.goto('/')

  const pause = page.getByRole('button', { name: 'Stop the slides moving' })
  await expect(pause).toBeVisible()

  await pause.click()
  await expect(page.getByRole('button', { name: 'Let the slides move again' })).toBeVisible()
})

test('a slide that is not showing is skipped by the keyboard', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Stop the slides moving' }).click()

  // The offscreen slides carry their own calls to action. Marking them inert
  // is what keeps those links out of the tab order.
  const hidden = page.locator(`${SLIDES}[aria-hidden="true"]`)
  await expect(hidden).toHaveCount(2)

  for (const slide of await hidden.all()) {
    await expect(slide).toHaveAttribute('inert', '')
  }
})
