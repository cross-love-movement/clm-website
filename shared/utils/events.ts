import type { Event, EventAvailability } from '#shared/types/content'

/** Shared by the server (capacity checks) and the client (display). */

export function remainingSeats(capacity: number, taken: number) {
  return Math.max(0, capacity - taken)
}

export function registrationDeadlinePassed(deadline?: string) {
  if (!deadline) return false

  return new Date(deadline).getTime() < Date.now()
}

export function toAvailability(
  event: Pick<Event, 'slug' | 'capacity' | 'registeredOffline' | 'registrationDeadline'>,
  registeredOnline: number,
): EventAvailability {
  const registered = event.registeredOffline + registeredOnline
  const remaining = remainingSeats(event.capacity, registered)

  return {
    slug: event.slug,
    capacity: event.capacity,
    registeredOffline: event.registeredOffline,
    registeredOnline,
    registered,
    remaining,
    open: remaining > 0 && !registrationDeadlinePassed(event.registrationDeadline),
  }
}
