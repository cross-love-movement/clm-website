import { requirePermission } from '../../../../features/auth/guards'
import { broadcastToEvent } from '../../../../features/events/repository'
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
  await requirePermission(event, 'canManageRegistrations')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const input = parseOrThrow(broadcastSchema, await readBody(event))
  const result = await broadcastToEvent(id, input)

  if (!result.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Event not found' })
  }

  return { recipients: result.recipients }
})
