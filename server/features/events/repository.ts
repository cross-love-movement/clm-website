import { and, asc, desc, eq, inArray, sum } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import type { Event, AdminEvent, AdminEventDetail } from '#shared/types/content'
import { buildAvailability, registrationDeadlinePassed } from '#shared/utils/events'

import { useDatabase } from '../../database/client'
import * as schema from '../../database/schema'
import {
  eventRegistrations,
  events,
  mailOutbox,
  type EventRow,
  type RegistrationRow,
  type RegistrationStatus,
} from '../../database/schema'
import {
  broadcastMail,
  calledOffMail,
  cancellationMail,
  confirmationMail,
  promotionMail,
  waitlistMail,
} from './mail'
import { generateReference } from './references'
import type { EventInput } from './schemas'

type Db = NodePgDatabase<typeof schema>
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

function toPublicEvent(row: EventRow, registered: number): Event {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    description: row.description,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    venue: row.venue,
    address: row.address,
    city: row.city,
    capacity: row.capacity,
    registrationDeadline: row.registrationDeadline ? row.registrationDeadline.toISOString() : null,
    featured: row.featured,
    image: row.image,
    imageAlt: row.imageAlt,
    availability: buildAvailability({
      capacity: row.capacity,
      registered,
      registrationDeadline: row.registrationDeadline,
    }),
  }
}

async function confirmedSeats(db: Db | Tx, eventId: string) {
  const [row] = await db
    .select({ total: sum(eventRegistrations.attendees) })
    .from(eventRegistrations)
    .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.status, 'confirmed')))

  return Number(row?.total ?? 0)
}

async function totalsByEvent(db: Db | Tx) {
  const rows = await db
    .select({ eventId: eventRegistrations.eventId, total: sum(eventRegistrations.attendees) })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.status, 'confirmed'))
    .groupBy(eventRegistrations.eventId)

  return new Map(rows.map((row) => [row.eventId, Number(row.total ?? 0)]))
}

export async function listPublishedEvents(): Promise<Event[]> {
  const db = useDatabase()
  const rows = await db
    .select()
    .from(events)
    .where(eq(events.status, 'published'))
    .orderBy(asc(events.startsAt))

  const totals = await totalsByEvent(db)

  return rows.map((row) => toPublicEvent(row, totals.get(row.id) ?? 0))
}

export async function getPublishedEvent(slug: string): Promise<Event | null> {
  const db = useDatabase()
  const [row] = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.status, 'published')))
    .limit(1)

  if (!row) return null

  return toPublicEvent(row, await confirmedSeats(db, row.id))
}

async function nextReference(tx: Tx, slug: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateReference(slug)
    const [existing] = await tx
      .select({ id: eventRegistrations.id })
      .from(eventRegistrations)
      .where(eq(eventRegistrations.reference, candidate))
      .limit(1)

    if (!existing) return candidate
  }

  throw new Error('Could not allocate a unique reference code')
}

export interface RegisterInput {
  slug: string
  name: string
  email: string
  phone?: string
  attendees: number
  notes?: string
}

export type RegisterResult =
  | { ok: true; status: 'confirmed' | 'waitlisted'; event: Event; registration: RegistrationRow }
  | { ok: false; reason: 'not-found' | 'closed' }

/**
 * Locks the event row, counts confirmed seats, and inserts the booking in one
 * transaction. If the requested places do not fit, the booking becomes a
 * waitlist entry instead of failing — the user still gets a reference.
 */
export async function registerForEvent(input: RegisterInput): Promise<RegisterResult> {
  const db = useDatabase()

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await db.transaction(async (tx) => {
        const [event] = await tx
          .select()
          .from(events)
          .where(and(eq(events.slug, input.slug), eq(events.status, 'published')))
          .for('update')

        if (!event) return { ok: false, reason: 'not-found' } as const
        if (registrationDeadlinePassed(event.registrationDeadline)) {
          return { ok: false, reason: 'closed' } as const
        }

        const taken = await confirmedSeats(tx, event.id)
        const remaining = Math.max(0, event.capacity - taken)
        const status = input.attendees <= remaining ? 'confirmed' : 'waitlisted'
        const reference = await nextReference(tx, event.slug)

        const [registration] = await tx
          .insert(eventRegistrations)
          .values({
            reference,
            eventId: event.id,
            name: input.name,
            email: input.email,
            phone: input.phone ?? '',
            attendees: input.attendees,
            notes: input.notes ?? '',
            status,
            consentAt: new Date(),
          })
          .returning()

        if (!registration) throw new Error('Insert returned no row')

        await tx
          .insert(mailOutbox)
          .values(
            status === 'confirmed'
              ? confirmationMail(event, registration)
              : waitlistMail(event, registration),
          )

        return {
          ok: true,
          status,
          event: toPublicEvent(event, status === 'confirmed' ? taken + input.attendees : taken),
          registration,
        } as const
      })
    } catch (error) {
      // 23505 = unique violation: the reference collided, so try a new one.
      if ((error as { code?: string }).code === '23505' && attempt < 2) continue
      throw error
    }
  }

  throw createError({ statusCode: 500, statusMessage: 'Could not create the booking' })
}

async function promoteWaitlist(tx: Tx, eventId: string) {
  const [event] = await tx.select().from(events).where(eq(events.id, eventId)).for('update')
  if (!event) return [] as RegistrationRow[]

  let remaining = Math.max(0, event.capacity - (await confirmedSeats(tx, eventId)))

  const waiting = await tx
    .select()
    .from(eventRegistrations)
    .where(
      and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.status, 'waitlisted')),
    )
    .orderBy(asc(eventRegistrations.createdAt))
    .for('update')

  const promoted: RegistrationRow[] = []

  for (const booking of waiting) {
    if (booking.attendees > remaining) continue

    const [updated] = await tx
      .update(eventRegistrations)
      .set({ status: 'confirmed' })
      .where(eq(eventRegistrations.id, booking.id))
      .returning()

    if (!updated) continue

    remaining -= booking.attendees
    promoted.push(updated)
    await tx.insert(mailOutbox).values(promotionMail(event, updated))
  }

  return promoted
}

/** Cancels a booking and offers the freed seats to the waitlist, FIFO. */
export async function cancelRegistration(id: string) {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id))
      .for('update')

    if (!row || row.status === 'cancelled') return { ok: false as const, promoted: [] }

    await tx
      .update(eventRegistrations)
      .set({ status: 'cancelled', cancelledAt: new Date() })
      .where(eq(eventRegistrations.id, id))

    // Only a confirmed booking gets a cancellation notice; a waitlisted one was
    // never promised a place.
    if (row.status === 'confirmed') {
      const [event] = await tx.select().from(events).where(eq(events.id, row.eventId)).limit(1)
      if (event) await tx.insert(mailOutbox).values(cancellationMail(event, row))
    }

    const promoted = row.status === 'confirmed' ? await promoteWaitlist(tx, row.eventId) : []

    return { ok: true as const, promoted }
  })
}

export interface AdminRegistrationRow extends RegistrationRow {
  eventTitle: string
  eventSlug: string
}

export async function listRegistrations(options: { eventSlug?: string } = {}) {
  const db = useDatabase()
  const rows = await db
    .select({
      registration: eventRegistrations,
      eventTitle: events.title,
      eventSlug: events.slug,
    })
    .from(eventRegistrations)
    .innerJoin(events, eq(events.id, eventRegistrations.eventId))
    .where(options.eventSlug ? eq(events.slug, options.eventSlug) : undefined)
    .orderBy(desc(eventRegistrations.createdAt))

  return rows.map<AdminRegistrationRow>((row) => ({
    ...row.registration,
    eventTitle: row.eventTitle,
    eventSlug: row.eventSlug,
  }))
}

export async function checkInRegistration(id: string) {
  const db = useDatabase()
  const [row] = await db
    .update(eventRegistrations)
    .set({ checkedInAt: new Date() })
    .where(and(eq(eventRegistrations.id, id), eq(eventRegistrations.status, 'confirmed')))
    .returning()

  return row ?? null
}

async function waitlistTotals(db: Db | Tx) {
  const rows = await db
    .select({ eventId: eventRegistrations.eventId, total: sum(eventRegistrations.attendees) })
    .from(eventRegistrations)
    .where(eq(eventRegistrations.status, 'waitlisted'))
    .groupBy(eventRegistrations.eventId)

  return new Map(rows.map((row) => [row.eventId, Number(row.total ?? 0)]))
}

function toAdminEvent(row: EventRow, registered: number, waitlisted: number): AdminEventDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    status: row.status,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    venue: row.venue,
    city: row.city,
    capacity: row.capacity,
    featured: row.featured,
    registered,
    remaining: Math.max(0, row.capacity - registered),
    waitlisted,
    summary: row.summary,
    description: row.description,
    address: row.address,
    registrationDeadline: row.registrationDeadline ? row.registrationDeadline.toISOString() : null,
    image: row.image,
    imageAlt: row.imageAlt,
  }
}

export async function listAllEvents(): Promise<AdminEvent[]> {
  const db = useDatabase()
  const rows = await db.select().from(events).orderBy(asc(events.startsAt))
  const registered = await totalsByEvent(db)
  const waitlisted = await waitlistTotals(db)

  return rows.map((row) =>
    toAdminEvent(row, registered.get(row.id) ?? 0, waitlisted.get(row.id) ?? 0),
  )
}

export async function getEventForEdit(id: string): Promise<AdminEventDetail | null> {
  const db = useDatabase()
  const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1)

  if (!row) return null

  return toAdminEvent(
    row,
    await confirmedSeats(db, row.id),
    (await waitlistTotals(db)).get(row.id) ?? 0,
  )
}

function isSlugConflict(error: unknown) {
  return (error as { code?: string }).code === '23505'
}

export async function createEvent(input: EventInput, createdBy?: string) {
  const db = useDatabase()

  try {
    const [row] = await db
      .insert(events)
      .values({ ...input, createdBy: createdBy ?? null })
      .returning()
    return row ?? null
  } catch (error) {
    if (isSlugConflict(error)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already used',
        data: {
          message: 'Another event already uses that slug.',
          errors: { slug: 'Choose a different slug.' },
        },
      })
    }
    throw error
  }
}

export async function updateEvent(id: string, input: EventInput) {
  const db = useDatabase()

  try {
    const [row] = await db
      .update(events)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning()

    return row ?? null
  } catch (error) {
    if (isSlugConflict(error)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Slug already used',
        data: {
          message: 'Another event already uses that slug.',
          errors: { slug: 'Choose a different slug.' },
        },
      })
    }
    throw error
  }
}

/** One email per address, so a guest who booked twice is not written to twice. */
function uniqueRecipients(rows: RegistrationRow[]) {
  const seen = new Map<string, RegistrationRow>()

  for (const row of rows) {
    const key = row.email.trim().toLowerCase()
    if (!seen.has(key)) seen.set(key, row)
  }

  return [...seen.values()]
}

const LIVE_REGISTRATION_STATUSES = ['confirmed', 'waitlisted'] as const

export type BroadcastAudience = 'confirmed' | 'all'

export interface BroadcastInput {
  subject: string
  body: string
  audience: BroadcastAudience
}

export type BroadcastResult = { ok: true; recipients: number } | { ok: false; reason: 'not-found' }

/**
 * Queues one message per guest on the event. Nothing is sent inline: the outbox
 * worker delivers it, so a mail outage leaves the rows pending rather than
 * losing the message.
 */
export async function broadcastToEvent(
  eventId: string,
  input: BroadcastInput,
): Promise<BroadcastResult> {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.id, eventId)).limit(1)
    if (!event) return { ok: false, reason: 'not-found' } as const

    const statuses: RegistrationStatus[] =
      input.audience === 'confirmed' ? ['confirmed'] : [...LIVE_REGISTRATION_STATUSES]

    const rows = await tx
      .select()
      .from(eventRegistrations)
      .where(
        and(eq(eventRegistrations.eventId, eventId), inArray(eventRegistrations.status, statuses)),
      )
      .orderBy(asc(eventRegistrations.createdAt))

    const recipients = uniqueRecipients(rows)
    if (!recipients.length) return { ok: true, recipients: 0 } as const

    await tx.insert(mailOutbox).values(recipients.map((row) => broadcastMail(event, row, input)))

    return { ok: true, recipients: recipients.length } as const
  })
}

export type CancelEventResult =
  | { ok: true; notified: number }
  | { ok: false; reason: 'not-found' | 'already-cancelled' }

/**
 * Marks the event cancelled and releases every booking. The event drops out of
 * the public calendar (only `published` is listed), and each guest receives the
 * event-level notice rather than the single-booking cancellation mail.
 */
export async function cancelEvent(id: string): Promise<CancelEventResult> {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const [event] = await tx.select().from(events).where(eq(events.id, id)).for('update')
    if (!event) return { ok: false, reason: 'not-found' } as const
    if (event.status === 'cancelled') return { ok: false, reason: 'already-cancelled' } as const

    await tx
      .update(events)
      .set({ status: 'cancelled', featured: false, updatedAt: new Date() })
      .where(eq(events.id, id))

    const live = await tx
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, id),
          inArray(eventRegistrations.status, [...LIVE_REGISTRATION_STATUSES]),
        ),
      )
      .for('update')

    if (live.length) {
      await tx
        .update(eventRegistrations)
        .set({ status: 'cancelled', cancelledAt: new Date() })
        .where(
          and(
            eq(eventRegistrations.eventId, id),
            inArray(eventRegistrations.status, [...LIVE_REGISTRATION_STATUSES]),
          ),
        )
    }

    const recipients = uniqueRecipients(live)
    if (recipients.length) {
      await tx.insert(mailOutbox).values(recipients.map((row) => calledOffMail(event, row)))
    }

    return { ok: true, notified: recipients.length } as const
  })
}
