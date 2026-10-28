import { z } from 'zod'

import { EVENT_CATEGORIES, EVENT_STATUSES } from '#shared/types/content'

const slug = z
  .string()
  .trim()
  .min(3, 'Use at least 3 characters.')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lower-case letters, numbers, and single hyphens.')

const text = (max: number) => z.string().trim().max(max)

export const eventInputSchema = z
  .object({
    slug,
    title: z.string().trim().min(3, 'Please enter a title.').max(160),
    category: z.enum(EVENT_CATEGORIES),
    summary: z.string().trim().min(10, 'Add a short summary.').max(400),
    description: text(20_000).default(''),
    startsAt: z.coerce.date({ message: 'Enter a valid start date and time.' }),
    endsAt: z.coerce.date({ message: 'Enter a valid end date and time.' }),
    venue: z.string().trim().min(1, 'Please enter a venue.').max(160),
    address: text(200).default(''),
    city: z.string().trim().min(1, 'Please enter a city.').max(120),
    capacity: z.coerce
      .number({ message: 'Enter the number of places.' })
      .int('Use a whole number.')
      .min(0)
      .max(100_000),
    registrationDeadline: z.coerce.date().nullable().optional(),
    status: z.enum(EVENT_STATUSES).default('draft'),
    featured: z.boolean().default(false),
    image: text(300).default(''),
    imageAlt: text(300).default(''),
  })
  .refine((value) => value.endsAt.getTime() > value.startsAt.getTime(), {
    message: 'The event must end after it starts.',
    path: ['endsAt'],
  })
  .refine(
    (value) =>
      !value.registrationDeadline ||
      value.registrationDeadline.getTime() < value.startsAt.getTime(),
    {
      message: 'Registration must close before the event starts.',
      path: ['registrationDeadline'],
    },
  )

export type EventInput = z.infer<typeof eventInputSchema>
