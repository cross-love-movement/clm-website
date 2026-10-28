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

/**
 * Fallback when live availability has not loaded: the offline count only.
 * The events page prefers `EventAvailability` from the server.
 */
export function offlinePlacesLeft(event: Pick<Event, 'capacity' | 'registeredOffline'>) {
  return Math.max(0, event.capacity - event.registeredOffline)
}
