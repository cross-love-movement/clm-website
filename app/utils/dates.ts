const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * Dates are stored with a UTC offset. Ghana is GMT, so UTC getters give the
 * correct local values and keep server and client output identical.
 */
export function dateParts(iso: string) {
  const date = new Date(iso)

  return {
    day: pad(date.getUTCDate()),
    month: MONTHS_SHORT[date.getUTCMonth()]!,
    monthLong: MONTHS_LONG[date.getUTCMonth()]!,
    weekday: WEEKDAYS_SHORT[date.getUTCDay()]!,
    weekdayLong: WEEKDAYS_LONG[date.getUTCDay()]!,
    year: date.getUTCFullYear(),
  }
}

/** 14 Nov 2026 */
export function formatDateShort(iso: string) {
  const parts = dateParts(iso)
  return `${parts.day} ${parts.month} ${parts.year}`
}

/** Saturday, 14 November 2026 */
export function formatDateLong(iso: string) {
  const parts = dateParts(iso)
  return `${parts.weekdayLong}, ${Number(parts.day)} ${parts.monthLong} ${parts.year}`
}

/** 18:00–20:30 GMT */
export function formatTimeRange(startsAt: string, endsAt: string) {
  const clock = (iso: string) => {
    const date = new Date(iso)
    return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
  }

  return `${clock(startsAt)}–${clock(endsAt)} GMT`
}
