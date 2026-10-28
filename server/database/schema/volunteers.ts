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

export const volunteerOpportunities = pgTable(
  'volunteer_opportunities',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    programmeId: uuid('programme_id')
      .notNull()
      .references(() => programmes.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    commitment: text('commitment').notNull().default(''),
    requirements: text('requirements')
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    /** Null means unlimited. */
    slots: integer('slots'),
    location: text('location').notNull().default(''),
    status: opportunityStatus('status').notNull().default('open'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('opportunities_programme_status_idx').on(table.programmeId, table.status),
    check('opportunity_slots_non_negative', sql`${table.slots} is null or ${table.slots} >= 0`),
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
    programmeId: uuid('programme_id')
      .notNull()
      .references(() => programmes.id, { onDelete: 'restrict' }),
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
  ],
)

export type ProgrammeRow = typeof programmes.$inferSelect
export type NewProgramme = typeof programmes.$inferInsert
export type OpportunityRow = typeof volunteerOpportunities.$inferSelect
export type VolunteerRow = typeof volunteers.$inferSelect
export type VolunteerApplicationRow = typeof volunteerApplications.$inferSelect
export type AssignmentRow = typeof volunteerAssignments.$inferSelect
