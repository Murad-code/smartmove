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

test('the mobile menu closes with the Escape key', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Open the menu' }).click()
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
})

test('the menu offers a direct way to call the office', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the menu' }).click()

  const menu = page.getByRole('dialog', { name: 'Menu' })
  await expect(menu.getByRole('link', { name: /^Call / })).toHaveAttribute('href', /^tel:/)
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
