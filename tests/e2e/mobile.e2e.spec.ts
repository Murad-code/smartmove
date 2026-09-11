import { expect, test } from '@playwright/test'

/** Mobile-specific behaviour, run on a phone viewport. */

test('the mobile menu opens, navigates and closes', async ({ page }) => {
  await page.goto('/')

  const trigger = page.getByRole('button', { name: 'Open the menu' })
  await expect(trigger).toBeVisible()
  await trigger.click()

  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()

  await menu.getByRole('link', { name: 'Properties' }).click()

  await expect(page).toHaveURL('/properties')
  await expect(menu).toBeHidden()
})

test('every mobile menu item is on screen when the menu opens', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the menu' }).click()

  const menu = page.getByRole('dialog', { name: 'Menu' })

  // The panel must cover the viewport, not just the header. `backdrop-filter`
  // on the header once made it the containing block for the fixed overlay,
  // which squashed the panel to the header's height and clipped every item.
  const viewport = page.viewportSize()!
  const box = (await menu.boundingBox())!
  expect(box.height).toBeGreaterThan(viewport.height * 0.9)

  for (const label of ['Properties', 'Landlords', 'Tenants', 'Services', 'About', 'Contact']) {
    await expect(menu.getByRole('link', { name: label })).toBeInViewport({ ratio: 0.9 })
  }
})

test('the mobile menu closes with the Escape key', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Open the menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
})

test("the layout opts in to Next's scroll reset while smooth scrolling is on", async ({ page }) => {
  await page.goto('/')

  // globals.css sets `scroll-behavior: smooth` for in-page anchors. Since
  // Next 16 that silently swallows the scroll reset on a route change, so
  // visitors land halfway down the page they just opened, unless the layout
  // opts in with this attribute. Keep the two in step.
  const { smooth, optIn } = await page.evaluate(() => ({
    smooth: getComputedStyle(document.documentElement).scrollBehavior === 'smooth',
    optIn: document.documentElement.getAttribute('data-scroll-behavior'),
  }))

  if (smooth) {
    expect(optIn, 'html needs data-scroll-behavior="smooth"').toBe('smooth')
  }
})

test('the menu offers a direct way to call the office', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the menu' }).click()

  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu.getByRole('link', { name: /^Call / })).toHaveAttribute('href', /^tel:/)
})

test('a visitor can swipe the property gallery', async ({ page }) => {
  await page.goto('/properties')
  await page.getByRole('article').first().getByRole('link').first().click()

  const gallery = page.getByRole('list', { name: /photographs$/ })
  await expect(page.getByText(/Photo 1 of/)).toBeVisible()

  await gallery.evaluate((el) => {
    const second = el.children[1]
    if (!(second instanceof HTMLElement)) return
    const left = second.offsetLeft - (el.clientWidth - second.clientWidth) / 2
    el.scrollTo({ left })
  })

  await expect(page.getByText(/Photo 2 of/)).toBeVisible()
})

test('property cards stack into a single column on a phone', async ({ page }) => {
  await page.goto('/properties')

  const cards = page.getByRole('article')
  await expect(cards.first()).toBeVisible()

  const first = await cards.nth(0).boundingBox()
  const second = await cards.nth(1).boundingBox()

  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  // Stacked, not side by side.
  expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1)
})

test('nothing overflows horizontally at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 })

  for (const path of ['/', '/properties', '/landlords', '/contact']) {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, `${path} should not scroll sideways at 320px`).toBeLessThanOrEqual(1)
  }
})

test('the mobile menu animates out and then actually goes away', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the menu' }).click()

  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()
  await expect(menu).toHaveClass(/animate-panel-in/)

  await menu.getByRole('button', { name: 'Close the menu' }).click()

  // The panel is held in the DOM for the length of the exit animation and
  // unmounted by a timer afterwards. If that timer were ever replaced with an
  // `animationend` listener, a browser that skipped the animation would leave
  // the menu open over a page whose scrolling is still locked.
  await expect(menu).toBeHidden()
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('a visitor who asked for less motion gets no menu animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  await page.getByRole('button', { name: 'Open the menu' }).click()
  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
})

test('hero copy does not stack during a slide change', async ({ page }) => {
  await page.goto('/')

  const copies = page.locator('.hero-slide-copy')
  const count = await copies.count()
  test.skip(count < 2, 'needs more than one hero slide')

  await page.getByRole('button', { name: 'Show slide 2' }).click()

  const overlapping = await page.evaluate(async () => {
    const slides = [...document.querySelectorAll('.hero-slide-copy')]
    const started = performance.now()
    while (performance.now() - started < 900) {
      const showing = slides.filter((el) => Number(getComputedStyle(el).opacity) > 0.2)
      if (showing.length > 1) return true
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    }
    return false
  })

  expect(overlapping).toBe(false)
})
