import { and, asc, desc, eq, sum } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import type { Event } from '#shared/types/content'
import { buildAvailability, registrationDeadlinePassed } from '#shared/utils/events'

import { useDatabase } from '../../database/client'
import * as schema from '../../database/schema'
import {
  eventRegistrations,
  events,
  mailOutbox,
  type EventRow,
  type RegistrationRow,
} from '../../database/schema'
import { confirmationMail, promotionMail, waitlistMail } from './mail'
import { generateReference } from './references'

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

    const promoted = row.status === 'confirmed' ? await promoteWaitlist(tx, row.eventId) : []

    return { ok: true as const, promoted }
  })
}

export interface AdminRegistration extends RegistrationRow {
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

  return rows.map<AdminRegistration>((row) => ({
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
