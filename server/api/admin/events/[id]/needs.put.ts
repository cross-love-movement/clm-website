import { requirePermission } from '../../../../features/auth/guards'
import { replaceEventNeeds } from '../../../../features/volunteers/repository'
import { eventNeedsInputSchema } from '../../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../../utils/validation'

/** Replace the volunteer line-up for one event. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const input = parseOrThrow(eventNeedsInputSchema, await readBody(event))
  const updated = await replaceEventNeeds(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  return { needs: input.needs.length }
})
