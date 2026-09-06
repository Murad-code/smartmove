import { z } from 'zod'

/**
 * Enquiry validation.
 *
 * These schemas are the single source of truth: the server actions parse
 * against them, and the tests assert against them. Messages are written to be
 * shown to a member of the public, not to a developer.
 */

const name = z.string().trim().min(2, 'Please enter your name').max(100, 'That name is too long')

const email = z
  .string()
  .trim()
  .min(1, 'Please enter your email address')
  .max(200, 'That email address is too long')
  .pipe(z.email('Please enter a valid email address'))

// Deliberately permissive: UK numbers are written a dozen different ways and
// rejecting an unusual format loses a real lead.
const telephone = z
  .string()
  .trim()
  .max(30, 'That telephone number is too long')
  .refine((value) => value === '' || /^[\d\s()+-]{7,}$/.test(value), {
    message: 'Please enter a valid telephone number',
  })

const requiredTelephone = telephone.refine((value) => value !== '', {
  message: 'Please enter a telephone number',
})

const message = z
  .string()
  .trim()
  .min(10, 'Please tell us a little more, at least 10 characters')
  .max(4000, 'That message is too long')

const optionalText = (max = 120) => z.string().trim().max(max).optional()

const consent = z.literal('yes', {
  message: 'Please confirm you are happy for us to contact you',
})

/** Shared by every form: the honeypot and the render timestamp. */
export const antiSpamSchema = z.object({
  companyWebsite: z.string().max(0).optional(),
  renderedAt: z.string().optional(),
})

export const generalEnquirySchema = antiSpamSchema.extend({
  name,
  email,
  telephone,
  enquiryTopic: optionalText(80),
  message,
  consent,
})

export const propertyEnquirySchema = antiSpamSchema.extend({
  propertyId: z.string().min(1),
  name,
  email,
  telephone: requiredTelephone,
  preferredViewing: optionalText(120),
  message,
  consent,
})

export const landlordEnquirySchema = antiSpamSchema.extend({
  name,
  email,
  telephone: requiredTelephone,
  postcode: z.string().trim().max(12, 'Please enter a valid postcode').optional(),
  serviceInterest: optionalText(80),
  message,
  consent,
})

export const requirementsSchema = antiSpamSchema.extend({
  name,
  email,
  telephone,
  preferredArea: optionalText(120),
  minBedrooms: z.coerce.number().int().min(0).max(20).optional(),
  maxRent: z.coerce.number().int().min(0).max(100_000).optional(),
  propertyType: optionalText(60),
  moveDate: optionalText(60),
  message: z.string().trim().max(4000).optional(),
  consent,
})

export type GeneralEnquiryInput = z.infer<typeof generalEnquirySchema>
export type PropertyEnquiryInput = z.infer<typeof propertyEnquirySchema>
export type LandlordEnquiryInput = z.infer<typeof landlordEnquirySchema>
export type RequirementsInput = z.infer<typeof requirementsSchema>

export type FieldErrors = Record<string, string>

/** Flattens a Zod error into one message per field, which is all the UI shows. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}
