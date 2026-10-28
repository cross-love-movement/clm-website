import { requirePermission } from '../../../features/auth/guards'
import { createEvent } from '../../../features/events/repository'
import { eventInputSchema } from '../../../features/events/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canEdit')

  const body = await readBody(event)
  const input = parseOrThrow(eventInputSchema, body)
  const created = await createEvent(input, actor.id)

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create the event' })
  }

  setResponseStatus(event, 201)
  return { id: created.id, slug: created.slug }
})
