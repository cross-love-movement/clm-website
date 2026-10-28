import { describe, expect, it } from 'vite-plus/test'

import { buildAvailability, remainingSeats } from '../shared/utils/events'
import { eventPrefix, generateReference, isReference } from '../server/features/events/references'

describe('event availability', () => {
  it('subtracts confirmed bookings from capacity', () => {
    const availability = buildAvailability({
      capacity: 100,
      registered: 30,
      registrationDeadline: null,
    })

    expect(availability.remaining).toBe(70)
    expect(availability.open).toBe(true)
  })

  it('never reports negative seats', () => {
    expect(remainingSeats(5, 9)).toBe(0)

    const availability = buildAvailability({
      capacity: 5,
      registered: 9,
      registrationDeadline: null,
    })

    expect(availability.remaining).toBe(0)
    expect(availability.open).toBe(false)
  })

  it('closes after the deadline even with seats left', () => {
    const availability = buildAvailability({
      capacity: 100,
      registered: 0,
      registrationDeadline: '2020-01-01T00:00:00+00:00',
    })

    expect(availability.remaining).toBe(100)
    expect(availability.open).toBe(false)
  })
})

describe('reference codes', () => {
  it('derives a three-letter prefix from the slug', () => {
    expect(eventPrefix('people-like-you-2027')).toBe('PEO')
    expect(eventPrefix('cross-sessions-2027')).toBe('CRO')
    expect(eventPrefix('!!!')).toBe('CLM')
  })

  it('generates a readable, verifiable code', () => {
    const reference = generateReference('people-like-you-2027')

    expect(reference.startsWith('PEO-')).toBe(true)
    expect(isReference(reference)).toBe(true)
  })

  it('avoids ambiguous characters', () => {
    for (let index = 0; index < 200; index += 1) {
      const code = generateReference('demo').slice(4)

      expect(code).not.toMatch(/[ILOU]/)
    }
  })

  it('does not repeat itself', () => {
    const codes = new Set(Array.from({ length: 500 }, () => generateReference('demo')))

    expect(codes.size).toBeGreaterThan(495)
  })
})
