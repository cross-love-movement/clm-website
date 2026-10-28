import { requirePermission } from '../../../../features/auth/guards'
import { listRegistrations } from '../../../../features/events/repository'

const RISKY_PREFIX = /^[=+\-@\t\r]/

function csvCell(value: string | number) {
  const text = String(value)
  // Spreadsheet apps treat a leading =, +, -, or @ as a formula. A leading
  // apostrophe forces the cell to text; Excel hides it, so the value still
  // reads normally. Notes, names, and phone numbers all come from the public.
  const safe = RISKY_PREFIX.test(text) ? `'${text}` : text

  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/**
 * GET /api/admin/events/registrations
 *   ?event=slug   narrow to one event
 *   ?format=csv   spreadsheet download
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageRegistrations')

  const query = getQuery(event)
  const slug = typeof query.event === 'string' && query.event ? query.event : undefined
  const rows = await listRegistrations({ eventSlug: slug })

  if (query.format === 'csv') {
    const header = [
      'reference',
      'event',
      'name',
      'email',
      'phone',
      'attendees',
      'status',
      'created_at',
      'checked_in_at',
      'notes',
    ]
    const lines = [
      header.join(','),
      ...rows.map((row) =>
        [
          row.reference,
          row.eventTitle,
          row.name,
          row.email,
          row.phone,
          row.attendees,
          row.status,
          row.createdAt.toISOString(),
          row.checkedInAt ? row.checkedInAt.toISOString() : '',
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
