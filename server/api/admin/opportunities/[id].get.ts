import { requirePermission } from '../../../features/auth/guards'
import { getRole } from '../../../features/volunteers/repository'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid role id' })

  const role = await getRole(id)

  if (!role) throw createError({ statusCode: 404, statusMessage: 'Role not found' })

  return role
})
