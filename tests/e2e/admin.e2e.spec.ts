import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

/**
 * The admin experience the business owner sees.
 *
 * Assertions are made against the URL and the page state rather than the
 * toast messages, which disappear on a timer and would make these flaky.
 */

test.describe.configure({ mode: 'serial' })

// Payload treats max-width 1440px as a collapsed hamburger sidebar. Playwright's
// Desktop Chrome viewport is 1280px, so clicks on sidebar links hit the page
// content instead of the nav. Use a real desktop width for these journeys.
test.use({ viewport: { width: 1600, height: 900 } })

test.beforeAll(async () => {
  await seedTestUser()
})

test.afterAll(async () => {
  await cleanupTestUser()
})

test.beforeEach(async ({ page }) => {
  await login({ page, user: testUser })
})

test('the sidebar shows business language, not developer language', async ({ page }) => {
  await page.goto('/admin')

  const nav = page.locator('.nav')
  await expect(nav.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Properties', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Website pages' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Enquiries' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Users' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Business Details' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Media' })).toBeVisible()

  // Payload's internal collections must never be on show.
  await expect(nav.getByRole('link', { name: /payload/i })).toHaveCount(0)
})

test('the admin panel carries no CMS vendor branding', async ({ page }) => {
  for (const path of ['/admin', '/admin/account', '/admin/collections/properties']) {
    await page.goto(path)
    await expect(page.locator('.nav')).toBeVisible()

    // Nothing a member of staff can read should name the CMS.
    const visibleText = await page.locator('body').innerText()
    expect(visibleText, `${path} should not mention Payload`).not.toMatch(/payload/i)
  }

  await expect(page).toHaveTitle(/Smart Move/)
  await expect(page.locator('link[rel="icon"]').first()).toHaveAttribute('href', '/brand-icon')
})

test('the sign-in screen shows the client brand, not the CMS brand', async ({ page }) => {
  await page.goto('/admin/logout')
  await page.goto('/admin/login')

  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Smart Move' }).first()).toBeVisible()
  await expect(page.locator('body')).not.toContainText(/payload/i)
})

test('the property form is split into tabs so the first screen stays short', async ({ page }) => {
  await page.goto('/admin/collections/properties/create')

  for (const tab of ['Property details', 'Photos', 'Address', 'More details']) {
    await expect(page.getByRole('button', { name: tab })).toBeVisible()
  }

  // Everything needed to publish is on the first tab.
  await expect(page.locator('#field-title')).toBeVisible()
  await expect(page.locator('#field-monthlyRent')).toBeVisible()
  await expect(page.locator('#field-bedrooms')).toBeVisible()
  await expect(page.locator('#field-displayLocation')).toBeVisible()
  await expect(page.locator('#field-shortDescription')).toBeVisible()
})

test('a property can be added, published, marked as let and removed', async ({ page }) => {
  const title = 'E2E Test Property, Ashby'
  const slug = 'e2e-test-property-ashby'

  // --- Add ----------------------------------------------------------------
  await page.goto('/admin/collections/properties/create')

  await page.locator('#field-title').fill(title)
  await page.locator('#field-monthlyRent').fill('695')
  await page.locator('#field-bedrooms').fill('3')
  await page.locator('#field-displayLocation').fill('Ashby, Scunthorpe')
  await page.locator('#field-shortDescription').fill('Created by the automated test suite.')
  await page.locator('#field-propertyType').click()
  await page.getByRole('option', { name: 'House — semi-detached' }).click()

  await page.getByRole('button', { name: 'Save', exact: true }).click()

  // Leaving the create route is the reliable signal that the save succeeded.
  await page.waitForURL(/\/admin\/collections\/properties\/\d+/)
  // The slug fills itself in, so the owner never has to think about URLs.
  await expect(page.locator('#field-slug')).toHaveValue(slug)

  const editUrl = page.url()

  // --- Live on the website straight away ----------------------------------
  await page.goto(`/properties/${slug}`)
  await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(page.getByText('£695 pcm').first()).toBeVisible()

  // --- Mark as let, and it disappears from the website --------------------
  await page.goto(editUrl)
  await page.locator('#field-status').click()
  await page.getByRole('option', { name: 'Let — hide from the website' }).click()
  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await expect(page.locator('#field-status')).toContainText('Let — hide from the website')

  const hidden = await page.goto(`/properties/${slug}`)
  expect(hidden?.status()).toBe(404)

  // --- Remove --------------------------------------------------------------
  await page.goto(editUrl)
  // Delete sits behind Payload's unlabelled overflow menu beside Save, so it
  // has to be reached by class rather than by role.
  await page.locator('.doc-controls__popup button').first().click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click()
  await page.waitForURL(/\/admin\/collections\/properties(\?|$)/)
})

test('enquiries sent through the website appear in the admin panel', async ({ page }) => {
  await page.goto('/admin/collections/enquiries')

  // The list columns are the ones a member of staff would triage by.
  await expect(page.getByRole('columnheader', { name: /Name/ })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /Type of enquiry/ })).toBeVisible()
  await expect(page.getByRole('columnheader', { name: /Dealt with/ })).toBeVisible()
})

test('an admin can open the form to add another user', async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Demo listings' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Load demo properties' })).toBeVisible()

  await page.goto('/admin/collections/users/create')
  await expect(page.locator('#field-name')).toBeVisible()
  await expect(page.locator('#field-email')).toBeVisible()
  await expect(page.locator('#field-role')).toBeVisible()
})

test('the sidebar and header make it obvious how to go home and log out', async ({ page }) => {
  await page.goto('/admin/collections/properties')

  await expect(page.locator('aside.nav')).toHaveClass(/nav--nav-open/)
  await page.locator('.nav').getByRole('link', { name: 'Dashboard', exact: true }).click()
  await expect(page).toHaveURL(/\/admin\/?$/)

  await page.locator('.header-log-out').click()
  await expect(page.getByLabel('Email')).toBeVisible()
})
