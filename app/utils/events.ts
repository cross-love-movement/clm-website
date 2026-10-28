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
