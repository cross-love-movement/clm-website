import { requirePermission } from '../../../features/auth/guards'
import { updateEvent } from '../../../features/events/repository'
import { eventInputSchema } from '../../../features/events/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canEdit')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const body = await readBody(event)
  const input = parseOrThrow(eventInputSchema, body)
  const updated = await updateEvent(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  return { id: updated.id, slug: updated.slug }
})
