import { expect, test } from '@playwright/test'

/**
 * The main tenant journey: land on the site, find a property, open it, filter
 * the list. Assumes `pnpm seed` has been run.
 */

test('the home page loads with the main navigation and a call to action', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'See available properties' })).toBeVisible()
  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('a visitor can reach the property list from the home page', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'See available properties' }).first().click()

  await expect(page).toHaveURL('/properties')
  await expect(page.getByRole('heading', { name: 'Properties to rent' })).toBeVisible()
  await expect(page.getByRole('article').first()).toBeVisible()
})

test('a visitor can open a property and see its details', async ({ page }) => {
  await page.goto('/properties')

  const firstCard = page.getByRole('article').first()
  const title = await firstCard.getByRole('heading').innerText()
  await firstCard.getByRole('link').first().click()

  await expect(page).toHaveURL(/\/properties\/.+/)
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()

  // The facts panel and the enquiry form are the two things this page exists for.
  await expect(page.getByText('Bedrooms').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Send enquiry' })).toBeVisible()
})

test('filtering narrows the list and stays in the URL', async ({ page }) => {
  await page.goto('/properties')

  const before = await page.getByRole('article').count()
  expect(before).toBeGreaterThan(0)

  await page.getByLabel('Bedrooms').selectOption('4')
  await expect(page).toHaveURL(/bedrooms=4/)

  const after = await page.getByRole('article').count()
  expect(after).toBeLessThan(before)

  // The filtered URL is shareable: a fresh load gives the same result.
  await page.reload()
  await expect(page.getByRole('article')).toHaveCount(after)
})

test('an impossible filter shows a helpful empty state', async ({ page }) => {
  await page.goto('/properties?bedrooms=5&maxRent=100')

  await expect(page.getByRole('heading', { name: /No properties match/ })).toBeVisible()
  await expect(
    page.locator('main').getByRole('link', { name: 'Register your requirements' }),
  ).toBeVisible()
})

test('the legal and contact pages load', async ({ page }) => {
  for (const path of ['/contact', '/privacy-policy', '/cookie-policy', '/terms', '/tenant-fees']) {
    const response = await page.goto(path)
    expect(response?.status(), `${path} should return 200`).toBe(200)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
})

test('an unknown address shows the custom not-found page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')

  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'We could not find that page' })).toBeVisible()
})
