import { requireStaff } from '../../../../features/auth/guards'
import { listRegistrations } from '../../../../features/events/repository'

function csvCell(value: string | number) {
  const text = String(value)

  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * GET /api/admin/events/registrations
 *   ?event=slug   narrow to one event
 *   ?format=csv   spreadsheet download
 */
export default defineEventHandler(async (event) => {
  await requireStaff(event)

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
