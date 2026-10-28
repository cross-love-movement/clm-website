import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { toAvailability } from '../shared/utils/events'
import { closeEventsDb } from '../server/features/events/db'
import {
  cancelRegistration,
  confirmedSeats,
  listRegistrations,
  reserveSeats,
} from '../server/features/events/repository'

let directory: string

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'clm-events-'))
  process.env.NUXT_EVENTS_DB_PATH = join(directory, 'events.sqlite')
  closeEventsDb()
})

afterEach(() => {
  closeEventsDb()
  rmSync(directory, { recursive: true, force: true })
  delete process.env.NUXT_EVENTS_DB_PATH
})

function booking(overrides: Partial<Parameters<typeof reserveSeats>[0]> = {}) {
  return {
    eventSlug: 'people-like-you-2027',
    capacity: 10,
    registeredOffline: 0,
    attendees: 1,
    name: 'Ama Mensah',
    email: 'ama@example.com',
    ...overrides,
  }
}

describe('event availability', () => {
  it('subtracts both offline and online takings', () => {
    const availability = toAvailability(
      {
        slug: 'demo',
        capacity: 100,
        registeredOffline: 20,
        registrationDeadline: undefined,
      },
      30,
    )

    expect(availability.registered).toBe(50)
    expect(availability.remaining).toBe(50)
    expect(availability.open).toBe(true)
  })

  it('closes when full, even without a deadline', () => {
    const availability = toAvailability(
      { slug: 'demo', capacity: 5, registeredOffline: 5, registrationDeadline: undefined },
      0,
    )

    expect(availability.remaining).toBe(0)
    expect(availability.open).toBe(false)
  })

  it('closes after the deadline', () => {
    const availability = toAvailability(
      {
        slug: 'demo',
        capacity: 100,
        registeredOffline: 0,
        registrationDeadline: '2020-01-01T00:00:00+00:00',
      },
      0,
    )

    expect(availability.remaining).toBe(100)
    expect(availability.open).toBe(false)
  })
})

describe('event registrations', () => {
  it('counts confirmed attendees, not registrations', () => {
    reserveSeats(booking({ attendees: 3 }))
    reserveSeats(booking({ attendees: 2, email: 'kofi@example.com' }))

    expect(confirmedSeats('people-like-you-2027')).toBe(5)
  })

  it('rejects a booking that would exceed capacity', () => {
    reserveSeats(booking({ capacity: 5, attendees: 4 }))

    const result = reserveSeats(booking({ capacity: 5, attendees: 2, email: 'kofi@example.com' }))

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.remaining).toBe(1)
      expect(result.registered).toBe(4)
    }
    expect(confirmedSeats('people-like-you-2027')).toBe(4)
  })

  it('counts offline bookings against capacity', () => {
    const result = reserveSeats(booking({ capacity: 10, registeredOffline: 8, attendees: 3 }))

    expect(result.ok).toBe(false)
    expect(confirmedSeats('people-like-you-2027')).toBe(0)
  })

  it('releases seats when a booking is cancelled', () => {
    const result = reserveSeats(booking({ capacity: 5, attendees: 4 }))
    expect(result.ok).toBe(true)

    const id = result.ok ? result.registration.id : 0
    expect(confirmedSeats('people-like-you-2027')).toBe(4)

    expect(cancelRegistration(id)).toBe(true)
    expect(confirmedSeats('people-like-you-2027')).toBe(0)
    expect(listRegistrations('people-like-you-2027')[0]?.status).toBe('cancelled')
  })

  it('keeps events isolated from one another', () => {
    reserveSeats(booking({ attendees: 2 }))
    reserveSeats(booking({ eventSlug: 'cross-sessions-2027', attendees: 5 }))

    expect(confirmedSeats('people-like-you-2027')).toBe(2)
    expect(confirmedSeats('cross-sessions-2027')).toBe(5)
  })
})
