import type { Event } from '#shared/types/content'

import { dateParts, formatDateLong, formatTimeRange } from './dates'

export { dateParts as eventDateParts }

export function formatEventDate(iso: string) {
  const parts = dateParts(iso)
  return `${parts.weekday} ${parts.day} ${parts.month} ${parts.year}`
}

export { formatDateLong as formatEventDateLong, formatTimeRange as formatEventTime }

export function isUpcoming(iso: string) {
  return new Date(iso).getTime() >= Date.now()
}

export function placesLeft(event: Event) {
  return Math.max(0, event.capacity - event.registered)
}

export function isRegistrationOpen(event: Event) {
  if (placesLeft(event) === 0) return false
  if (!event.registrationDeadline) return true

  return new Date(event.registrationDeadline).getTime() >= Date.now()
}
