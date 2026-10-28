import { sql } from 'drizzle-orm'
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { users } from './users'

export const eventCategory = pgEnum('event_category', [
  'session',
  'training',
  'workshop',
  'devotion',
  'outreach',
  'showcase',
])

export const eventStatus = pgEnum('event_status', ['draft', 'published', 'archived'])

export const registrationStatus = pgEnum('registration_status', [
  'confirmed',
  'waitlisted',
  'cancelled',
])

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    category: eventCategory('category').notNull(),
    summary: text('summary').notNull(),
    /** Markdown body, rendered by the client if a detail page needs it. */
    description: text('description').notNull().default(''),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    venue: text('venue').notNull(),
    address: text('address').notNull().default(''),
    city: text('city').notNull(),
    capacity: integer('capacity').notNull(),
    registrationDeadline: timestamp('registration_deadline', { withTimezone: true }),
    status: eventStatus('status').notNull().default('draft'),
    featured: boolean('featured').notNull().default(false),
    image: text('image').notNull().default(''),
    imageAlt: text('image_alt').notNull().default(''),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('events_status_starts_idx').on(table.status, table.startsAt),
    check('events_capacity_non_negative', sql`${table.capacity} >= 0`),
  ],
)

export const eventRegistrations = pgTable(
  'event_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    /** Emailed to the registrant, e.g. PEO-7K4M2Q. */
    reference: text('reference').notNull().unique(),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull().default(''),
    attendees: integer('attendees').notNull(),
    notes: text('notes').notNull().default(''),
    status: registrationStatus('status').notNull().default('confirmed'),
    consentAt: timestamp('consent_at', { withTimezone: true }).notNull(),
    checkedInAt: timestamp('checked_in_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  },
  (table) => [
    index('registrations_event_status_idx').on(table.eventId, table.status),
    check('registrations_attendees_range', sql`${table.attendees} between 1 and 20`),
  ],
)

/**
 * Rendered mail waiting to be sent. Registration commits first; the worker
 * sends afterwards, so a mail outage can never lose a booking, and a retry
 * cannot double-send a confirmed row.
 */
export const mailOutbox = pgTable(
  'mail_outbox',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull(),
    toEmail: text('to_email').notNull(),
    /** Optional Reply-To, so staff can answer the person who submitted. */
    replyTo: text('reply_to'),
    subject: text('subject').notNull(),
    body: text('body').notNull(),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
  },
  (table) => [index('mail_outbox_status_idx').on(table.status, table.createdAt)],
)

export type EventRow = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type RegistrationRow = typeof eventRegistrations.$inferSelect
export type RegistrationStatus = RegistrationRow['status']
export type MailOutboxRow = typeof mailOutbox.$inferSelect
