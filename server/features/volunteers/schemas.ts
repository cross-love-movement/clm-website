import { z } from 'zod'

import {
  ASSIGNMENT_STATUSES,
  AVAILABILITY_OPTIONS,
  BACKGROUND_CHECK_STATUSES,
  OPPORTUNITY_STATUSES,
  PROGRAMME_STATUSES,
  PROGRAMME_TYPES,
  VOLUNTEER_STATUSES,
} from '../../../shared/types/volunteers'

const slug = z
  .string()
  .trim()
  .min(3, 'Use at least 3 characters.')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lower-case letters, numbers, and single hyphens.')

const text = (max: number) => z.string().trim().max(max)

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a date in YYYY-MM-DD form.')
  .nullable()
  .optional()

export const programmeInputSchema = z
  .object({
    slug,
    title: z.string().trim().min(3, 'Please enter a title.').max(160),
    type: z.enum(PROGRAMME_TYPES).default('other'),
    summary: text(400).default(''),
    description: text(20_000).default(''),
    location: text(160).default(''),
    contentPath: text(200).default(''),
    status: z.enum(PROGRAMME_STATUSES).default('planned'),
    startsAt: z.coerce.date().nullable().optional(),
    endsAt: z.coerce.date().nullable().optional(),
  })
  .refine((value) => !value.startsAt || !value.endsAt || value.endsAt > value.startsAt, {
    message: 'The programme must end after it starts.',
    path: ['endsAt'],
  })

export type ProgrammeInput = z.infer<typeof programmeInputSchema>

export const opportunityInputSchema = z.object({
  title: z.string().trim().min(2, 'Please enter a role title.').max(160),
  description: text(4_000).default(''),
  commitment: text(160).default(''),
  requirements: z.array(z.string().trim().max(200)).max(20).default([]),
  slots: z.coerce.number().int('Use a whole number.').min(0).max(10_000).nullable().optional(),
  location: text(160).default(''),
  status: z.enum(OPPORTUNITY_STATUSES).default('open'),
})

export type OpportunityInput = z.infer<typeof opportunityInputSchema>

export const applicationSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.email('Please enter a valid email address.').max(200),
  phone: text(40).optional().default(''),
  city: z.string().trim().min(2, 'Please tell us where you are based.').max(120),
  area: text(160).optional().default(''),
  availability: z.enum(AVAILABILITY_OPTIONS, {
    message: 'Please choose your availability.',
  }),
  experience: text(2_000).optional().default(''),
  message: text(2_000).optional().default(''),
  programmeId: z.preprocess(
    (value) => (value === '' || value === 'none' ? null : value),
    z.uuid().nullable().optional(),
  ),
  opportunityId: z.preprocess(
    (value) => (value === '' || value === 'none' ? null : value),
    z.uuid().nullable().optional(),
  ),
  consent: z.literal(true, { message: 'Please agree before submitting.' }),
  company: z.string().optional().default(''),
})

export type ApplicationInput = z.infer<typeof applicationSchema>

export const volunteerUpdateSchema = z.object({
  status: z.enum(VOLUNTEER_STATUSES).optional(),
  phone: text(40).optional(),
  city: text(120).optional(),
  skills: z.array(z.string().trim().max(80)).max(30).optional(),
  availability: text(40).optional(),
  notes: text(4_000).optional(),
  emergencyContactName: text(120).optional(),
  emergencyContactPhone: text(40).optional(),
  dateOfBirth: optionalDate,
  safeguardingBriefingAt: z.coerce.date().nullable().optional(),
  backgroundCheckStatus: z.enum(BACKGROUND_CHECK_STATUSES).optional(),
})

export type VolunteerUpdateInput = z.infer<typeof volunteerUpdateSchema>

export const assignmentInputSchema = z.object({
  volunteerId: z.uuid(),
  programmeId: z.uuid(),
  opportunityId: z.uuid().nullable().optional(),
  roleTitle: text(160).default(''),
  status: z.enum(ASSIGNMENT_STATUSES).default('planned'),
  startsOn: optionalDate,
  endsOn: optionalDate,
  notes: text(2_000).default(''),
})

export type AssignmentInput = z.infer<typeof assignmentInputSchema>

export const assignmentUpdateSchema = z.object({
  roleTitle: text(160).optional(),
  status: z.enum(ASSIGNMENT_STATUSES).optional(),
  startsOn: optionalDate,
  endsOn: optionalDate,
  notes: text(2_000).optional(),
})

export type AssignmentUpdateInput = z.infer<typeof assignmentUpdateSchema>
