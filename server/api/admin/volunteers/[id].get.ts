import { requirePermission } from '../../../features/auth/guards'
import { getVolunteer } from '../../../features/volunteers/repository'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid volunteer id' })

  const found = await getVolunteer(id)

  if (!found) throw createError({ statusCode: 404, statusMessage: 'Volunteer not found' })

  return found
})
