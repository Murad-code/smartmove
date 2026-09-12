import { expect, test } from '@playwright/test'

/**
 * The motion system. See docs/motion.md.
 *
 * The reason this file exists: a scroll-reveal system fails by leaving content
 * permanently invisible. That is the worst possible failure for a business
 * site and it is completely silent, because the markup, the styles and the
 * tests all still look fine. Everything here is really one assertion in
 * different circumstances: the words are on the screen.
 */

/** Something below the fold on the home page that reveals as you reach it. */
const REVEALS = '.reveal, .reveal-group'

test('the hero is legible the moment the page opens', async ({ page }) => {
  await page.goto('/')

  // The heading sits inside the masked wrapper that slides it up from behind
  // its own box, so this is also the guard on that mask never being left
  // closed.
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('h1')).not.toBeEmpty()

  // Above-the-fold content must not be waiting on a scroll that never comes.
  // Every slide carries a mask, so this is the first one rather than all of them.
  await expect(page.locator('.rise-mask > span').first()).toBeVisible()
})

test('content below the fold arrives as it is scrolled to', async ({ page }) => {
  await page.goto('/')

  // Nothing has been reached yet, so nothing has been revealed.
  await expect(page.locator('.revealed')).toHaveCount(0)
  await expect(page.locator(REVEALS).first()).not.toBeInViewport()

  await page.locator(REVEALS).first().scrollIntoViewIfNeeded()

  await expect(page.locator('.revealed').first()).toBeVisible()
  // Opacity is what the reveal animates, so a revealed element that is still
  // transparent is the exact bug this file is here to catch.
  await expect(page.locator(REVEALS).first()).toHaveCSS('opacity', '1')
})

test('the header shrinks once you are reading rather than arriving', async ({ page }) => {
  await page.goto('/')

  const html = page.locator('html')
  await expect(html).not.toHaveAttribute('data-scrolled', /.*/)

  // Wait for smoothed scrolling to attach before sending a wheel event.
  // `goto` resolves on load, which is before hydration, and a wheel delivered
  // in that gap goes nowhere. The class is Lenis's own signal that it is live.
  await expect(html).toHaveClass(/lenis/)

  // The pointer also has to be over the page before a wheel event has anywhere
  // to go: Playwright starts it at the very corner of the viewport.
  await page.mouse.move(400, 400)
  await page.mouse.wheel(0, 600)

  await expect(html).toHaveAttribute('data-scrolled', '')
  // The contact strip collapses rather than disappearing, so it has to still
  // be reachable by anyone reading the header with a screen reader.
  await expect(page.locator('.header-strip')).toBeAttached()
})

test('the figures count up to the values the owner typed', async ({ page }) => {
  await page.goto('/')

  const figures = page.locator('[data-count-to]')
  const count = await figures.count()
  expect(count).toBeGreaterThan(0)

  for (let index = 0; index < count; index += 1) {
    const figure = figures.nth(index)
    await figure.scrollIntoViewIfNeeded()

    const { prefix, to, suffix } = await figure.evaluate((el) => ({
      prefix: (el as HTMLElement).dataset.countPrefix ?? '',
      to: (el as HTMLElement).dataset.countTo ?? '',
      suffix: (el as HTMLElement).dataset.countSuffix ?? '',
    }))

    // The counter animates towards the figure and must land exactly on it.
    // Counting to something that is not what the CMS says is worse than not
    // animating at all.
    await expect(figure).toHaveText(`${prefix}${to}${suffix}`)
  }
})

test('copy already on screen under a photo header does not wait for a scroll', async ({ page }) => {
  // Tall enough that a `lg:min-h-[38rem]` photo header leaves the first
  // section in the lower viewport rather than below it. The previous observer
  // inset of 12% treated that band as still off-screen.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/tenants')

  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll('.reveal, .reveal-group')].filter((el) => {
              const box = el.getBoundingClientRect()
              const onScreen = box.bottom > 0 && box.top < window.innerHeight
              return onScreen && getComputedStyle(el).opacity !== '1'
            }).length,
        ),
      { timeout: 10_000 },
    )
    .toBe(0)
})

test('landing part-way down leaves nothing waiting to be revealed', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.scrollTo(0, 1200))

  // The observer reports what is already on screen as soon as it starts
  // watching. This is the guard on that: arriving part-way down a page, from a
  // deep link or a restored scroll, must not leave the section you arrived in
  // invisible until you happen to scroll. It is the one failure that would
  // make the page look broken rather than merely unanimated.
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            [...document.querySelectorAll('.reveal, .reveal-group')].filter((el) => {
              const box = el.getBoundingClientRect()
              const onScreen = box.bottom > 0 && box.top < window.innerHeight
              return onScreen && getComputedStyle(el).opacity !== '1'
            }).length,
        ),
      { timeout: 10_000 },
    )
    .toBe(0)
})

test('a new page opens at the top rather than at the last page position', async ({ page }) => {
  await page.goto('/')

  await page.evaluate(() => window.scrollTo(0, 1200))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'See all properties' }).click()
  await expect(page).toHaveURL(/\/properties/)

  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 10_000 }).toBe(0)
})

test.describe('with reduced motion', () => {
  test('the whole page is visible without scrolling anywhere', async ({ page }) => {
    // Set explicitly before navigating, matching the mobile suite. The
    // `reducedMotion` fixture is applied around the same moment as the
    // document's own first script, and the two race.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // Asserted on the rendered result rather than on `data-motion`, because
    // the flag is set by a script during the initial parse and Playwright
    // applies its media emulation around the same moment. The guarantee that
    // matters is not which mechanism won the race: it is that a visitor who
    // asked for less motion can read the page without scrolling into it.
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator(REVEALS).first()).toHaveCSS('opacity', '1')

    // Figures show the real value immediately rather than counting from zero.
    const figure = page.locator('[data-count-to]').first()
    const expected = await figure.evaluate((el) => {
      const data = (el as HTMLElement).dataset
      return `${data.countPrefix ?? ''}${data.countTo ?? ''}${data.countSuffix ?? ''}`
    })
    await expect(figure).toHaveText(expected)
  })
})
