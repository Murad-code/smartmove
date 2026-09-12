import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export interface LoginOptions {
  page: Page
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login({ page, user }: LoginOptions): Promise<void> {
  await page.goto('/admin/login')

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/admin(\?|$)/)
  // On a phone the menu is a closed drawer, so the aside is in the DOM but
  // not visible. The page body is what tells us the session actually loaded.
  await expect(page.locator('.template-default__wrap')).toBeVisible()
  await expect(page.locator('.nav')).toBeAttached()
}
