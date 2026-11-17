import { recordAudit } from '../../../../features/audit/repository'
import { requirePermission } from '../../../../features/auth/guards'
import { cancelEvent, getEventForEdit } from '../../../../features/events/repository'

/**
 * POST /api/admin/events/:id/cancel
 *
 * One-way in practice: the event is marked cancelled, every live booking is
 * released, and each guest is queued the event-level cancellation notice. The
 * per-booking cancel action still exists on the registrations table.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canEdit')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const title = (await getEventForEdit(id))?.title ?? id
  const result = await cancelEvent(id)

  if (!result.ok) {
    if (result.reason === 'not-found') {
      throw createError({ statusCode: 404, statusMessage: 'Event not found' })
    }

    throw createError({
      statusCode: 409,
      statusMessage: 'Event already cancelled',
      data: { message: 'This event was already cancelled.' },
    })
  }

  await recordAudit(actor, {
    action: 'event.cancelled',
    entity: 'event',
    entityId: id,
    summary: `Cancelled “${title}” and released ${result.notified} booking(s).`,
    metadata: { title, notified: result.notified },
  })

  return { notified: result.notified }
})
