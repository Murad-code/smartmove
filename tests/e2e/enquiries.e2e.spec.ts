import { expect, test } from '@playwright/test'

/**
 * One successful submission is enough to prove the form, the server action and
 * the email provider are wired together. The other three enquiry types are
 * covered by schema tests; sending them here would hit the provider on every
 * run against a reused `pnpm dev` (which keeps EMAIL_PROVIDER from .env).
 *
 * Enquiries land in the development database; delete them from the admin
 * panel if they get in the way.
 */

const uniqueEmail = () => `e2e-${Date.now()}@smartmove.test`

test('a visitor can send a general enquiry', async ({ page }) => {
  await page.goto('/contact')

  await page.getByLabel('Your name').fill('Test Visitor')
  await page.getByLabel('Email address').fill(uniqueEmail())
  await page.getByLabel('Telephone').fill('01724 856260')
  await page.getByLabel('What is your enquiry about?').selectOption('Renting a property')
  await page
    .getByLabel('Your message')
    .fill('This message was sent by the automated end-to-end test suite.')
  await page.getByLabel(/happy for Smart Move/).check()

  // The forms reject anything submitted within two seconds of rendering.
  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  await expect(page.getByText('Message sent')).toBeVisible()
})

test('validation errors are shown against the fields they belong to', async ({ page }) => {
  await page.goto('/contact')

  await page.getByLabel('Your name').fill('T')
  await page.getByLabel('Email address').fill('not-an-email')
  await page.getByLabel('Your message').fill('short')

  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  await expect(page.getByText('Please enter a valid email address')).toBeVisible()
  await expect(page.getByText('We could not send your message')).toBeVisible()

  // The invalid control is marked up so a screen reader announces the problem.
  await expect(page.getByLabel('Email address')).toHaveAttribute('aria-invalid', 'true')

  // React resets the form after the action; the fields must come back with
  // what was typed so a missing consent box does not wipe the whole enquiry.
  await expect(page.getByLabel('Your name')).toHaveValue('T')
  await expect(page.getByLabel('Email address')).toHaveValue('not-an-email')
  await expect(page.getByLabel('Your message')).toHaveValue('short')
})

test('an enquiry missing only consent keeps the rest of the details', async ({ page }) => {
  await page.goto('/contact')

  await page.getByLabel('Your name').fill('Jane Fletcher')
  await page.getByLabel('Email address').fill('jane@example.com')
  await page.getByLabel('Telephone').fill('01724 856260')
  await page.getByLabel('What is your enquiry about?').selectOption('Renting a property')
  await page
    .getByLabel('Your message')
    .fill('I would like to arrange a viewing next week if possible.')

  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  await expect(page.getByText('Please confirm you are happy for us to contact you')).toBeVisible()
  await expect(page.getByLabel('Your name')).toHaveValue('Jane Fletcher')
  await expect(page.getByLabel('Email address')).toHaveValue('jane@example.com')
  await expect(page.getByLabel('Telephone')).toHaveValue('01724 856260')
  await expect(page.getByLabel('What is your enquiry about?')).toHaveValue('Renting a property')
  await expect(page.getByLabel('Your message')).toHaveValue(
    'I would like to arrange a viewing next week if possible.',
  )
  await expect(page.getByLabel(/happy for Smart Move/)).not.toBeChecked()
})
