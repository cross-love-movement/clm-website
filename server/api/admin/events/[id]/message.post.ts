import { recordAudit } from '../../../../features/audit/repository'
import { requirePermission } from '../../../../features/auth/guards'
import { broadcastToEvent, getEventForEdit } from '../../../../features/events/repository'
import { broadcastSchema } from '../../../../features/events/schemas'
import { parseOrThrow } from '../../../../utils/validation'

/**
 * POST /api/admin/events/:id/message
 *
 * Queues a staff-written message to the event's guests. `audience=confirmed`
 * writes to confirmed bookings only; `audience=all` includes the waitlist.
 * Cancelled bookings are never written to. One email per address.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManageRegistrations')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const input = parseOrThrow(broadcastSchema, await readBody(event))
  const title = (await getEventForEdit(id))?.title ?? id
  const result = await broadcastToEvent(id, input)

  if (!result.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  await recordAudit(actor, {
    action: 'event.messaged',
    entity: 'event',
    entityId: id,
    summary: `Emailed ${result.recipients} guest(s) about “${title}”: ${input.subject}.`,
    metadata: { title, subject: input.subject, recipients: result.recipients },
  })

  return { recipients: result.recipients }
})
