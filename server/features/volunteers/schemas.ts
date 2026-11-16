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

const optionalPlaces = z.preprocess(
  (value) => (value === '' || value === undefined ? null : value),
  z.coerce.number().int('Use a whole number.').min(0).max(10_000).nullable(),
)

/** One role needed somewhere: a programme, an event, or a general opening. */
const needInputSchema = z.object({
  opportunityId: z.uuid(),
  /** People needed. Null means no limit. */
  places: optionalPlaces,
  /** Optional window. Event needs use these; programme needs ride on the season. */
  startsAt: z.coerce.date().nullable().optional(),
  endsAt: z.coerce.date().nullable().optional(),
})

function hasNoRepeatedRoles(needs: { opportunityId: string }[]) {
  return new Set(needs.map((need) => need.opportunityId)).size === needs.length
}

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
    /** The roles this programme needs, with a headcount for each. */
    needs: z.array(needInputSchema).max(50).default([]),
  })
  .refine((value) => !value.startsAt || !value.endsAt || value.endsAt > value.startsAt, {
    message: 'The programme must end after it starts.',
    path: ['endsAt'],
  })
  .refine((value) => hasNoRepeatedRoles(value.needs), {
    message: 'Each role can only be added once.',
    path: ['needs'],
  })

export type ProgrammeInput = z.infer<typeof programmeInputSchema>

/** Replace the volunteer line-up for one event. */
export const eventNeedsInputSchema = z
  .object({
    needs: z.array(needInputSchema).max(50).default([]),
  })
  .refine((value) => hasNoRepeatedRoles(value.needs), {
    message: 'Each role can only be added once.',
    path: ['needs'],
  })

export type EventNeedsInput = z.infer<typeof eventNeedsInputSchema>

export const opportunityInputSchema = z.object({
  title: z.string().trim().min(2, 'Please enter a role title.').max(160),
  description: text(4_000).default(''),
  commitment: text(160).default(''),
  requirements: z.array(z.string().trim().max(200)).max(20).default([]),
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
  /** The specific opening chosen, if any. */
  needId: z.preprocess(
    (value) => (value === '' || value === 'none' ? null : value),
    z.uuid().nullable().optional(),
  ),
  /** The role, for a general opening with no programme or event. */
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

export const assignmentInputSchema = z
  .object({
    volunteerId: z.uuid(),
    /** Exactly one of these is set: the programme or the event they serve at. */
    programmeId: z.preprocess(
      (value) => (value === '' || value === 'none' ? null : value),
      z.uuid().nullable().optional(),
    ),
    eventId: z.preprocess(
      (value) => (value === '' || value === 'none' ? null : value),
      z.uuid().nullable().optional(),
    ),
    needId: z.preprocess(
      (value) => (value === '' || value === 'none' ? null : value),
      z.uuid().nullable().optional(),
    ),
    opportunityId: z.preprocess(
      (value) => (value === '' || value === 'none' ? null : value),
      z.uuid().nullable().optional(),
    ),
    roleTitle: text(160).default(''),
    status: z.enum(ASSIGNMENT_STATUSES).default('planned'),
    startsOn: optionalDate,
    endsOn: optionalDate,
    notes: text(2_000).default(''),
  })
  .refine((value) => (value.programmeId ? !value.eventId : Boolean(value.eventId)), {
    message: 'Choose either a programme or an event.',
    path: ['programmeId'],
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
