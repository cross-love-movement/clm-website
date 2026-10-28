import { z } from 'zod'

const name = z
  .string()
  .trim()
  .min(2, 'Please enter your name.')
  .max(120, 'That name is a little too long.')

const email = z.email('Please enter a valid email address.').max(200)

const optionalPhone = z.string().trim().max(40).optional().default('')

const message = (min = 10) =>
  z
    .string()
    .trim()
    .min(min, 'Please add a little more detail.')
    .max(4000, 'That message is a little too long.')

const consent = z
  .boolean()
  .refine((value) => value === true, { message: 'Please confirm we may contact you.' })

export const contactTopics = [
  'general',
  'volunteering',
  'partnership',
  'donation',
  'media',
  'complaint',
] as const

export const contactSchema = z.object({
  name,
  email,
  phone: optionalPhone,
  topic: z.string().refine((value) => (contactTopics as readonly string[]).includes(value), {
    message: 'Please choose a topic.',
  }),
  message: message(20),
  consent,
})

export const partnershipSchema = z.object({
  organisation: z.string().trim().min(2, 'Please enter your organisation’s name.').max(160),
  contactName: name,
  email,
  phone: optionalPhone,
  type: z.string().min(1, 'Please choose a partnership type.'),
  message: message(20),
  consent,
})

export const newsletterSchema = z.object({
  email,
})

export const donationSchema = z.object({
  name,
  email,
  amount: z.coerce
    .number({ message: 'Please choose or enter an amount.' })
    .min(50, 'The minimum gift is GH₵50.')
    .max(1_000_000, 'Please contact us directly for gifts of this size.'),
  frequency: z.enum(['one-time', 'monthly'], { message: 'Please choose a giving frequency.' }),
  note: z.string().trim().max(1000).optional().default(''),
})

export const eventRegistrationSchema = z.object({
  eventSlug: z.string().trim().min(1, 'Please choose an event.'),
  name,
  email,
  phone: optionalPhone,
  attendees: z.coerce
    .number({ message: 'Please choose how many are coming.' })
    .int('Please use a whole number.')
    .min(1, 'At least one person must attend.')
    .max(10, 'Please contact us for groups larger than 10.'),
  notes: z.string().trim().max(1000).optional().default(''),
  consent,
})
