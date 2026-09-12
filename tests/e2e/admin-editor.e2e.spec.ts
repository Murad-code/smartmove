import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUserFor } from '../helpers/seedUser'

/**
 * An editor must be able to sign in and look after the website. They must
 * not be able to manage other staff accounts.
 */

const editor = {
  ...testUserFor('editor'),
  role: 'editor' as const,
}

test.describe.configure({ mode: 'serial' })
test.use({ viewport: { width: 1600, height: 900 } })

test.beforeAll(async () => {
  await seedTestUser(editor)
})

test.afterAll(async () => {
  await cleanupTestUser(editor)
})

test.beforeEach(async ({ page }) => {
  await login({ page, user: editor })
})

test('an editor can sign in and manage content, but not staff accounts', async ({ page }) => {
  await page.goto('/admin')

  await expect(
    page.getByRole('heading', { name: /does not have access to the admin panel/i }),
  ).toHaveCount(0)

  const nav = page.locator('.nav')
  await expect(nav.getByRole('link', { name: 'Properties', exact: true })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Website pages' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Enquiries' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Users' })).toHaveCount(0)
})
