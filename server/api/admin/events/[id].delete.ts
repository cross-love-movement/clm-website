import { recordAudit } from '../../../features/audit/repository'
import { requirePermission } from '../../../features/auth/guards'
import { deleteEvent, getEventForEdit } from '../../../features/events/repository'

/**
 * DELETE /api/admin/events/:id
 *
 * Only for events that never had a booking. Registrations are attendance
 * records, so an event with any booking is cancelled or archived instead.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canEdit')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const title = (await getEventForEdit(id))?.title ?? id
  const result = await deleteEvent(id)

  if (!result.ok) {
    if (result.reason === 'not-found') {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'This event still has bookings',
      data: {
        message:
          'Events with bookings are kept as attendance records, including released ones. Cancel or archive it instead of deleting.',
      },
    })
  }

  await recordAudit(actor, {
    action: 'event.deleted',
    entity: 'event',
    entityId: id,
    summary: `Deleted “${title}”, which had never taken a booking.`,
    metadata: { title },
  })

  return { message: 'Event deleted.' }
})
