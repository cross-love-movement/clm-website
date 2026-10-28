import type { EventAvailability } from '#shared/types/content'

/** Shared by the server (capacity checks) and the client (display). */

export function remainingSeats(capacity: number, taken: number) {
  return Math.max(0, capacity - taken)
}

export function registrationDeadlinePassed(deadline: string | Date | null | undefined) {
  if (!deadline) return false

  return new Date(deadline).getTime() < Date.now()
}

export function buildAvailability(input: {
  capacity: number
  registered: number
  registrationDeadline: string | Date | null | undefined
}): EventAvailability {
  const remaining = remainingSeats(input.capacity, input.registered)

  return {
    capacity: input.capacity,
    registered: input.registered,
    remaining,
    open: remaining > 0 && !registrationDeadlinePassed(input.registrationDeadline),
  }
}
