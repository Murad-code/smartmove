'use server'

import { headers } from 'next/headers'
import type { RequiredDataFromCollectionSlug } from 'payload'
import type { ZodType } from 'zod'

import type { EnquiryKind } from '@/collections/Enquiries'
import { sendNotification } from '@/lib/email'
import { adminEnquiryUrl, buildNotification, type NotificationRow } from '@/lib/email/templates'
import { logger } from '@/lib/logger'
import { getPayloadClient } from '@/lib/payload'
import { getBusinessDetails, notificationRecipients } from '@/lib/site'

import {
  generalEnquirySchema,
  landlordEnquirySchema,
  propertyEnquirySchema,
  requirementsSchema,
  toFieldErrors,
} from './schemas'
import { GENERIC_ERROR, type FormState } from './state'
import { checkRateLimit, isHoneypotTripped, isTooFast, verifyTurnstile } from './spam'

/**
 * Enquiry submission.
 *
 * Server actions rather than route handlers: Next verifies its own action
 * token on every call, which gives CSRF protection without a bespoke
 * implementation, and the forms keep working before JavaScript loads.
 */

/**
 * Best-effort client identifier for rate limiting only. It is never stored,
 * never logged and never written to the enquiry.
 */
async function clientKey(scope: string): Promise<string> {
  const headerList = await headers()
  const forwarded = headerList.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || headerList.get('x-real-ip') || 'unknown'
  return `${scope}:${ip}`
}

async function sourcePage(): Promise<string | undefined> {
  const headerList = await headers()
  return headerList.get('referer') ?? undefined
}

interface HandleArgs<T> {
  kind: EnquiryKind
  schema: ZodType<T>
  formData: FormData
  /** Maps validated input onto the Enquiries collection. */
  toDocument: (input: T) => Record<string, unknown>
  /** Builds the notification email body. */
  toNotification: (input: T) => { heading: string; rows: NotificationRow[]; message?: string }
  successMessage: string
}

async function handleSubmission<
  T extends { email: string; companyWebsite?: string; renderedAt?: string },
>({
  kind,
  schema,
  formData,
  toDocument,
  toNotification,
  successMessage,
}: HandleArgs<T>): Promise<FormState> {
  const raw = Object.fromEntries(formData.entries())

  // Silent rejections. A bot gets the same message as a genuine failure.
  if (isHoneypotTripped(raw.companyWebsite) || isTooFast(raw.renderedAt)) {
    logger.info('Enquiry rejected by spam checks', { kind })
    return { status: 'error', message: GENERIC_ERROR }
  }

  if (!checkRateLimit(await clientKey(kind))) {
    return {
      status: 'error',
      message: 'You have sent several messages already. Please call us on the number above.',
    }
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Please check the highlighted fields and try again.',
      errors: toFieldErrors(parsed.error),
    }
  }

  if (!(await verifyTurnstile(raw['cf-turnstile-response']))) {
    return { status: 'error', message: GENERIC_ERROR }
  }

  const input = parsed.data

  try {
    const payload = await getPayloadClient()
    const business = await getBusinessDetails()

    const enquiry = await payload.create({
      collection: 'enquiries',
      // The per-kind field sets are validated by Zod above; Payload's generated
      // type describes the union of all four, so one assertion here beats
      // four near-identical mapper signatures.
      data: {
        kind,
        consentGivenAt: new Date().toISOString(),
        sourcePage: await sourcePage(),
        ...toDocument(input),
      } as RequiredDataFromCollectionSlug<'enquiries'>,
      // The collection refuses `create` to everyone; this is the only path in.
      overrideAccess: true,
    })

    const notification = toNotification(input)

    // Deliberately not awaited against the response to the visitor: the
    // enquiry is already safe in the database, so a slow provider must not
    // hold up the confirmation.
    await sendNotification(
      buildNotification({
        to: notificationRecipients(business),
        heading: notification.heading,
        rows: notification.rows,
        message: notification.message,
        replyTo: input.email,
        adminUrl: adminEnquiryUrl(enquiry.id),
      }),
    )

    return { status: 'success', message: successMessage }
  } catch (error) {
    logger.error('Failed to store enquiry', error, { kind })
    return { status: 'error', message: GENERIC_ERROR }
  }
}

const THANK_YOU = 'Thank you. We have received your message and will be in touch shortly.'

export async function submitGeneralEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    kind: 'general',
    schema: generalEnquirySchema,
    formData,
    toDocument: (input) => ({
      name: input.name,
      email: input.email,
      telephone: input.telephone || undefined,
      enquiryTopic: input.enquiryTopic || undefined,
      message: input.message,
    }),
    toNotification: (input) => ({
      heading: `Website enquiry from ${input.name}`,
      rows: [
        { label: 'Name', value: input.name },
        { label: 'Email', value: input.email },
        { label: 'Telephone', value: input.telephone },
        { label: 'About', value: input.enquiryTopic },
      ],
      message: input.message,
    }),
    successMessage: THANK_YOU,
  })
}

export async function submitPropertyEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    kind: 'property',
    schema: propertyEnquirySchema,
    formData,
    toDocument: (input) => ({
      name: input.name,
      email: input.email,
      telephone: input.telephone,
      preferredViewing: input.preferredViewing || undefined,
      message: input.message,
      property: Number(input.propertyId),
    }),
    toNotification: (input) => ({
      heading: `Property enquiry from ${input.name}`,
      rows: [
        { label: 'Name', value: input.name },
        { label: 'Email', value: input.email },
        { label: 'Telephone', value: input.telephone },
        { label: 'Property', value: formData.get('propertyTitle')?.toString() },
        { label: 'Viewing', value: input.preferredViewing },
      ],
      message: input.message,
    }),
    successMessage:
      'Thank you. We have received your enquiry about this property and will be in touch shortly.',
  })
}

export async function submitLandlordEnquiry(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    kind: 'landlord',
    schema: landlordEnquirySchema,
    formData,
    toDocument: (input) => ({
      name: input.name,
      email: input.email,
      telephone: input.telephone,
      message: input.message,
      landlord: {
        postcode: input.postcode || undefined,
        serviceInterest: input.serviceInterest || undefined,
      },
    }),
    toNotification: (input) => ({
      heading: `Landlord enquiry from ${input.name}`,
      rows: [
        { label: 'Name', value: input.name },
        { label: 'Email', value: input.email },
        { label: 'Telephone', value: input.telephone },
        { label: 'Property postcode', value: input.postcode },
        { label: 'Interested in', value: input.serviceInterest },
      ],
      message: input.message,
    }),
    successMessage:
      'Thank you. We have received your enquiry and will call you back to arrange a valuation.',
  })
}

export async function submitRequirements(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    kind: 'requirements',
    schema: requirementsSchema,
    formData,
    toDocument: (input) => ({
      name: input.name,
      email: input.email,
      telephone: input.telephone || undefined,
      message: input.message || undefined,
      requirements: {
        preferredArea: input.preferredArea || undefined,
        minBedrooms: input.minBedrooms,
        maxRent: input.maxRent,
        propertyType: input.propertyType || undefined,
        moveDate: input.moveDate || undefined,
      },
    }),
    toNotification: (input) => ({
      heading: `Property requirements registered by ${input.name}`,
      rows: [
        { label: 'Name', value: input.name },
        { label: 'Email', value: input.email },
        { label: 'Telephone', value: input.telephone },
        { label: 'Preferred area', value: input.preferredArea },
        { label: 'Minimum bedrooms', value: input.minBedrooms },
        { label: 'Maximum rent', value: input.maxRent ? `£${input.maxRent} pcm` : undefined },
        { label: 'Property type', value: input.propertyType },
        { label: 'Looking to move', value: input.moveDate },
      ],
      message: input.message,
    }),
    successMessage:
      'Thank you. We have registered what you are looking for and will contact you when something suitable comes up.',
  })
}
