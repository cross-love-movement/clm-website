import { sql } from 'drizzle-orm'
import {
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { events } from './events'
import { users } from './users'

export const programmeType = pgEnum('programme_type', [
  'cmp',
  'yep',
  'cross-sessions',
  'symposium',
  'outreach',
  'other',
])

export const programmeStatus = pgEnum('programme_status', [
  'planned',
  'active',
  'completed',
  'archived',
])

export const opportunityStatus = pgEnum('opportunity_status', ['open', 'closed'])

export const volunteerStatus = pgEnum('volunteer_status', [
  'applied',
  'screening',
  'approved',
  'invited',
  'active',
  'paused',
  'declined',
  'withdrawn',
  'alumni',
])

export const backgroundCheckStatus = pgEnum('background_check_status', [
  'not_required',
  'pending',
  'cleared',
  'failed',
])

export const assignmentStatus = pgEnum('assignment_status', [
  'planned',
  'active',
  'completed',
  'cancelled',
])

/**
 * Operational programmes. The public story can stay in Content; this row is
 * what volunteers apply to and what assignments point at.
 */
export const programmes = pgTable(
  'programmes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    type: programmeType('type').notNull().default('other'),
    summary: text('summary').notNull().default(''),
    description: text('description').notNull().default(''),
    location: text('location').notNull().default(''),
    /** Optional public story, e.g. /projects/people-like-you. */
    contentPath: text('content_path').notNull().default(''),
    status: programmeStatus('status').notNull().default('planned'),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    coordinatorId: uuid('coordinator_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('programmes_status_starts_idx').on(table.status, table.startsAt)],
)

/**
 * The reusable catalogue of volunteer roles. A role describes a kind of work
 * (mentor, media, logistics); where it is needed lives in `volunteerNeeds`.
 */
export const volunteerOpportunities = pgTable(
  'volunteer_opportunities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    commitment: text('commitment').notNull().default(''),
    requirements: text('requirements')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    location: text('location').notNull().default(''),
    status: opportunityStatus('status').notNull().default('open'),
    /** Soft delete: kept so past applications still show their role title. */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('opportunities_status_deleted_idx').on(table.status, table.deletedAt)],
)

/**
 * A concrete demand for a role: how many people, and where. It belongs to a
 * programme (seasonal work), to an event (a dated need), or to neither — in
 * which case the role is offered as a general volunteer role.
 */
export const volunteerNeeds = pgTable(
  'volunteer_needs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => volunteerOpportunities.id, { onDelete: 'cascade' }),
    programmeId: uuid('programme_id').references(() => programmes.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
    /** People needed. Null means no limit. */
    places: integer('places'),
    /** Optional window: a slot on an event day, or a season on a programme. */
    startsAt: timestamp('starts_at', { withTimezone: true }),
    endsAt: timestamp('ends_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('volunteer_needs_programme_idx').on(table.programmeId),
    index('volunteer_needs_event_idx').on(table.eventId),
    check(
      'volunteer_need_places_non_negative',
      sql`${table.places} is null or ${table.places} >= 0`,
    ),
    check(
      'volunteer_need_single_container',
      sql`num_nonnulls(${table.programmeId}, ${table.eventId}) <= 1`,
    ),
    check(
      'volunteer_need_has_container',
      sql`num_nonnulls(${table.programmeId}, ${table.eventId}) = 1`,
    ),
  ],
)

/**
 * A volunteer profile. `user_id` stays null until the person is approved and
 * invited, because applications arrive without an account.
 */
export const volunteers = pgTable(
  'volunteers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .unique()
      .references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    phone: text('phone').notNull().default(''),
    city: text('city').notNull().default(''),
    skills: text('skills')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    availability: text('availability').notNull().default(''),
    experience: text('experience').notNull().default(''),
    status: volunteerStatus('status').notNull().default('applied'),
    notes: text('notes').notNull().default(''),
    emergencyContactName: text('emergency_contact_name').notNull().default(''),
    emergencyContactPhone: text('emergency_contact_phone').notNull().default(''),
    dateOfBirth: date('date_of_birth'),
    safeguardingConsentAt: timestamp('safeguarding_consent_at', { withTimezone: true }),
    safeguardingBriefingAt: timestamp('safeguarding_briefing_at', { withTimezone: true }),
    backgroundCheckStatus: backgroundCheckStatus('background_check_status')
      .notNull()
      .default('not_required'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('volunteers_status_idx').on(table.status, table.createdAt)],
)

/** Every public submission, so repeat applications are visible to staff. */
export const volunteerApplications = pgTable(
  'volunteer_applications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    volunteerId: uuid('volunteer_id')
      .notNull()
      .references(() => volunteers.id, { onDelete: 'cascade' }),
    programmeId: uuid('programme_id').references(() => programmes.id, { onDelete: 'set null' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    needId: uuid('need_id').references(() => volunteerNeeds.id, { onDelete: 'set null' }),
    opportunityId: uuid('opportunity_id').references(() => volunteerOpportunities.id, {
      onDelete: 'set null',
    }),
    area: text('area').notNull().default(''),
    availability: text('availability').notNull().default(''),
    experience: text('experience').notNull().default(''),
    message: text('message').notNull().default(''),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('applications_volunteer_idx').on(table.volunteerId, table.createdAt)],
)

export const volunteerAssignments = pgTable(
  'volunteer_assignments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    volunteerId: uuid('volunteer_id')
      .notNull()
      .references(() => volunteers.id, { onDelete: 'cascade' }),
    /** Exactly one of `programmeId` / `eventId` is set: where the person serves. */
    programmeId: uuid('programme_id').references(() => programmes.id, { onDelete: 'restrict' }),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'restrict' }),
    needId: uuid('need_id').references(() => volunteerNeeds.id, { onDelete: 'set null' }),
    opportunityId: uuid('opportunity_id').references(() => volunteerOpportunities.id, {
      onDelete: 'set null',
    }),
    roleTitle: text('role_title').notNull().default(''),
    status: assignmentStatus('status').notNull().default('planned'),
    startsOn: date('starts_on'),
    endsOn: date('ends_on'),
    notes: text('notes').notNull().default(''),
    assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('assignments_volunteer_status_idx').on(table.volunteerId, table.status),
    index('assignments_programme_status_idx').on(table.programmeId, table.status),
    index('assignments_event_status_idx').on(table.eventId, table.status),
    check(
      'assignment_single_container',
      sql`num_nonnulls(${table.programmeId}, ${table.eventId}) = 1`,
    ),
  ],
)

export type ProgrammeRow = typeof programmes.$inferSelect
export type NewProgramme = typeof programmes.$inferInsert
export type OpportunityRow = typeof volunteerOpportunities.$inferSelect
export type VolunteerNeedRow = typeof volunteerNeeds.$inferSelect
export type VolunteerRow = typeof volunteers.$inferSelect
export type VolunteerApplicationRow = typeof volunteerApplications.$inferSelect
export type AssignmentRow = typeof volunteerAssignments.$inferSelect
