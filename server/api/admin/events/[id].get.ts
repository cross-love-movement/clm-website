import { requireStaff } from '../../../features/auth/guards'
import { getEventForEdit } from '../../../features/events/repository'

export default defineEventHandler(async (event) => {
  await requireStaff(event)

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  const found = await getEventForEdit(id)

  if (!found) throw createError({ statusCode: 404, statusMessage: 'Event not found' })

  return found
})
