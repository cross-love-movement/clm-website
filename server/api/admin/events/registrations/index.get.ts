import { requirePermission } from '../../../../features/auth/guards'
import { listRegistrations } from '../../../../features/events/repository'
import { csvLine } from '../../../../utils/csv'

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
        csvLine([
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
        ]),
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
