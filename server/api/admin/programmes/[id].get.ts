import { requireAnyPermission } from '../../../features/auth/guards'
import { getProgramme } from '../../../features/volunteers/repository'

export default defineEventHandler(async (event) => {
  await requireAnyPermission(event, ['canManageProgrammes', 'canManageVolunteers'])

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid programme id' })

  const found = await getProgramme(id)

  if (!found) throw createError({ statusCode: 404, statusMessage: 'Programme not found' })

  return found
})
