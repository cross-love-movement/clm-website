import { useEventsDb } from './db'

export interface EventRegistration {
  id: number
  eventSlug: string
  name: string
  email: string
  phone: string
  attendees: number
  notes: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
}

interface RegistrationRow {
  id: number
  event_slug: string
  name: string
  email: string
  phone: string
  attendees: number
  notes: string
  status: 'confirmed' | 'cancelled'
  created_at: string
}

function mapRow(row: RegistrationRow): EventRegistration {
  return {
    id: row.id,
    eventSlug: row.event_slug,
    name: row.name,
    email: row.email,
    phone: row.phone,
    attendees: row.attendees,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
  }
}

/** Seats taken through the website for one event. */
export function confirmedSeats(eventSlug: string): number {
  const db = useEventsDb()
  const row = db
    .prepare(
      `SELECT COALESCE(SUM(attendees), 0) AS total
         FROM event_registrations
        WHERE event_slug = ? AND status = 'confirmed'`,
    )
    .get(eventSlug) as { total: number } | undefined

  return Number(row?.total ?? 0)
}

/** Newest first. Pass a slug to narrow to one event. */
export function listRegistrations(eventSlug?: string): EventRegistration[] {
  const db = useEventsDb()
  const statement = eventSlug
    ? db.prepare(
        `SELECT * FROM event_registrations WHERE event_slug = ? ORDER BY created_at DESC, id DESC`,
      )
    : db.prepare(`SELECT * FROM event_registrations ORDER BY created_at DESC, id DESC`)

  const rows = (eventSlug
    ? statement.all(eventSlug)
    : statement.all()) as unknown as RegistrationRow[]

  return rows.map(mapRow)
}

export interface ReserveSeatsInput {
  eventSlug: string
  capacity: number
  registeredOffline: number
  attendees: number
  name: string
  email: string
  phone?: string
  notes?: string
}

export type ReserveSeatsResult =
  | { ok: true; registration: EventRegistration; registeredOnline: number }
  | { ok: false; registered: number; remaining: number }

/**
 * Check capacity and insert in one write transaction.
 *
 * `BEGIN IMMEDIATE` takes the write lock before the read, so two simultaneous
 * group bookings cannot both pass the capacity check with too few seats left.
 */
export function reserveSeats(input: ReserveSeatsInput): ReserveSeatsResult {
  const db = useEventsDb()
  db.exec('BEGIN IMMEDIATE')

  try {
    const registeredOnline = confirmedSeats(input.eventSlug)
    const registered = input.registeredOffline + registeredOnline
    const remaining = Math.max(0, input.capacity - registered)

    if (input.attendees > remaining) {
      db.exec('ROLLBACK')
      return { ok: false, registered, remaining }
    }

    const result = db
      .prepare(
        `INSERT INTO event_registrations
           (event_slug, name, email, phone, attendees, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.eventSlug,
        input.name,
        input.email,
        input.phone ?? '',
        input.attendees,
        input.notes ?? '',
      )

    db.exec('COMMIT')

    return {
      ok: true,
      registration: {
        id: Number(result.lastInsertRowid),
        eventSlug: input.eventSlug,
        name: input.name,
        email: input.email,
        phone: input.phone ?? '',
        attendees: input.attendees,
        notes: input.notes ?? '',
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      },
      registeredOnline: registeredOnline + input.attendees,
    }
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

/** Cancelling keeps the record but releases the seats. */
export function cancelRegistration(id: number): boolean {
  const db = useEventsDb()
  const result = db
    .prepare(
      `UPDATE event_registrations SET status = 'cancelled' WHERE id = ? AND status = 'confirmed'`,
    )
    .run(id)

  return Number(result.changes) > 0
}
