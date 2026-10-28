import { requireRegistrationsToken } from '../../features/events/admin'
import { listRegistrations } from '../../features/events/repository'

function csvCell(value: string | number) {
  const text = String(value)

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Registrant list for the events team.
 *
 *   GET /api/events/registrations            → JSON
 *   GET /api/events/registrations?event=slug → JSON for one event
 *   GET /api/events/registrations?format=csv → spreadsheet download
 *
 * Protected by `NUXT_REGISTRATIONS_TOKEN` (Bearer token or x-admin-token).
 */
export default defineEventHandler((event) => {
  requireRegistrationsToken(event)

  const query = getQuery(event)
  const slug = typeof query.event === 'string' && query.event ? query.event : undefined
  const rows = listRegistrations(slug)

  if (query.format === 'csv') {
    const header = [
      'id',
      'event',
      'name',
      'email',
      'phone',
      'attendees',
      'status',
      'created_at',
      'notes',
    ]
    const lines = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.id,
          row.eventSlug,
          row.name,
          row.email,
          row.phone,
          row.attendees,
          row.status,
          row.createdAt,
          row.notes,
        ]
          .map(csvCell)
          .join(','),
      ),
    ]

    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(
      event,
      'content-disposition',
      `attachment; filename="clm-registrations${slug ? `-${slug}` : ''}.csv"`,
    )

    return lines.join('\n')
  }

  return rows
})
