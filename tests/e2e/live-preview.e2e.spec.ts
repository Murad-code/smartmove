import { expect, test, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUserFor } from '../helpers/seedUser'

/**
 * Live preview: the website shown beside the editing form.
 *
 * The point of the feature is that the owner never has to guess what a change
 * will look like, so these check the pane renders the real page and follows an
 * edit, not just that a button exists. The other half of the feature is that
 * nothing unpublished escapes the pane, which is checked here too.
 *
 * The page these edit is created and removed by the suite. Seeded content is
 * only ever read.
 */

test.describe.configure({ mode: 'serial' })

// Payload collapses the sidebar under 1440px, and the preview pane needs room.
test.use({ viewport: { width: 1600, height: 900 } })

// Its own account and its own page, so this file can run beside the admin
// journeys without either deleting the other's fixtures.
const user = testUserFor('live-preview')

const fixture = {
  title: 'E2E Live Preview Page',
  slug: 'e2e-live-preview-page',
}

let fixturePageId: number | string

async function removeFixturePage(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'pages',
    where: { slug: { equals: fixture.slug } },
    overrideAccess: true,
  })
}

test.beforeAll(async () => {
  await seedTestUser(user)
  await removeFixturePage()

  const payload = await getPayload({ config })
  const created = await payload.create({
    collection: 'pages',
    data: { title: fixture.title, slug: fixture.slug, _status: 'published' },
    overrideAccess: true,
  })
  fixturePageId = created.id
})

test.afterAll(async () => {
  await removeFixturePage()
  await cleanupTestUser(user)
})

test.beforeEach(async ({ page }) => {
  await login({ page, user })
})

/** Opens the preview pane and returns the website inside it. */
async function openPreview(page: Page) {
  const toggler = page.locator('#live-preview-toggler')
  await expect(toggler).toBeVisible()
  await toggler.click()

  const iframe = page.locator('#live-preview-iframe')
  await expect(iframe).toBeVisible()
  await expect(iframe).toHaveAttribute('src', /\?preview=true$/)

  return page.frameLocator('#live-preview-iframe')
}

test('a website page can be previewed and the pane follows an edit', async ({ page, request }) => {
  await page.goto(`/admin/collections/pages/${fixturePageId}`)

  const preview = await openPreview(page)
  await expect(preview.getByRole('heading', { level: 1, name: fixture.title })).toBeVisible()

  const edited = 'Edited while previewing'
  await page.locator('#field-hero__heading').fill(edited)

  // Pages autosave, so the pane catches up without anything being clicked.
  await expect(preview.getByRole('heading', { level: 1, name: edited })).toBeVisible()

  // Autosave writes a draft, so a visitor must still see the published page.
  // This is what the whole feature rests on: preview shows unpublished work
  // only to whoever is signed in.
  const published = await request.get(`/${fixture.slug}?preview=true`)
  expect(published.status()).toBe(200)
  const html = await published.text()
  expect(html).toContain(fixture.title)
  expect(html).not.toContain(edited)
})

test('a service can be previewed', async ({ page }) => {
  await page.goto('/admin/collections/services')
  await page.locator('.table tbody a').first().click()
  await page.waitForURL(/\/admin\/collections\/services\/\d+/)

  const title = await page.locator('#field-title').inputValue()
  const preview = await openPreview(page)

  await expect(preview.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(preview.getByRole('link', { name: 'All services' })).toBeVisible()
})

test('a property hidden from the website can still be previewed', async ({ page, request }) => {
  const title = 'E2E Live Preview Property, Ashby'

  // Properties have no draft state, so preview has to show a listing whatever
  // its availability. Otherwise the owner could not check a property over
  // before putting it on the website, which is the main reason to preview one.
  await page.goto('/admin/collections/properties/create')
  await page.locator('#field-title').fill(title)
  await page.locator('#field-monthlyRent').fill('725')
  await page.locator('#field-bedrooms').fill('3')
  await page.locator('#field-displayLocation').fill('Ashby, Scunthorpe')
  await page.locator('#field-shortDescription').fill('Created by the automated test suite.')
  await page.locator('#field-propertyType').click()
  await page.getByRole('option', { name: 'House — semi-detached' }).click()
  await page.locator('#field-status').click()
  await page.getByRole('option', { name: 'Not ready yet — hide from the website' }).click()

  await page.getByRole('button', { name: 'Save', exact: true }).click()
  await page.waitForURL(/\/admin\/collections\/properties\/\d+/)

  const slug = await page.locator('#field-slug').inputValue()

  // A visitor gets nothing, flag or no flag. The `request` fixture has its own
  // cookie jar, so this really is a signed-out request.
  const hidden = await request.get(`/properties/${slug}?preview=true`)
  expect(hidden.status()).toBe(404)

  // The owner, editing it, sees it.
  const preview = await openPreview(page)
  await expect(preview.getByRole('heading', { level: 1, name: title })).toBeVisible()
  await expect(preview.getByText('£725 pcm').first()).toBeVisible()

  // Delete sits behind Payload's unlabelled overflow menu beside Save.
  await page.locator('.doc-controls__popup button').first().click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirm' }).click()
  await page.waitForURL(/\/admin\/collections\/properties(\?|$)/)
})

test('the home page can be previewed', async ({ page }) => {
  await page.goto('/admin/globals/home-page')

  const preview = await openPreview(page)
  const heading = await page.locator('#field-hero__slides__0__heading').inputValue()

  await expect(preview.getByRole('heading', { level: 1, name: heading })).toBeVisible()
})

test('the preview flag changes nothing for a signed-out visitor', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()

  const withFlag = await page.goto('/?preview=true')
  expect(withFlag?.status()).toBe(200)
  await expect(page.locator('h1')).toBeVisible()

  await context.close()
})
