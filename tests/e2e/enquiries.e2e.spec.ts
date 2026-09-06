import { expect, test } from '@playwright/test'

/**
 * Enquiry submission end to end, including the server-side validation and the
 * timing check. Enquiries land in the development database; delete them from
 * the admin panel if they get in the way.
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

test('a visitor can enquire about a specific property', async ({ page }) => {
  await page.goto('/properties')
  await page.getByRole('article').first().getByRole('link').first().click()

  await page.getByLabel('Your name').fill('Test Visitor')
  await page.getByLabel('Email address').fill(uniqueEmail())
  await page.getByLabel('Telephone').fill('07700 900123')
  await page.getByLabel(/happy for Smart Move/).check()

  // The message is pre-filled with the property name, which is the point of
  // the property-specific form.
  await expect(page.getByLabel('Your message')).toHaveValue(/I would like to arrange a viewing/)

  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Send enquiry' }).click()

  await expect(page.getByText('Message sent')).toBeVisible()
})

test('a landlord can request a valuation', async ({ page }) => {
  await page.goto('/landlords')

  await page.getByLabel('Your name').fill('Test Landlord')
  await page.getByLabel('Email address').fill(uniqueEmail())
  await page.getByLabel('Telephone').fill('01724 856260')
  await page.getByLabel('Postcode of your property').fill('DN15 7JW')
  await page.getByLabel('What are you interested in?').selectOption('Full property management')
  await page
    .getByLabel('Tell us about the property')
    .fill('Three bedroom semi, currently empty, sent by the automated test suite.')
  await page.getByLabel(/happy for Smart Move/).check()

  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Request a callback' }).click()

  await expect(page.getByText('Message sent')).toBeVisible()
})

test('an applicant can register their requirements', async ({ page }) => {
  await page.goto('/register-interest')

  await page.getByLabel('Your name').fill('Test Applicant')
  await page.getByLabel('Email address').fill(uniqueEmail())
  await page.getByLabel('Preferred area').fill('Ashby')
  await page.getByLabel('Minimum bedrooms').fill('2')
  await page.getByLabel('Maximum monthly rent').fill('700')
  await page.getByLabel(/happy for Smart Move/).check()

  await page.waitForTimeout(2500)
  await page.getByRole('button', { name: 'Register my requirements' }).click()

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
})
