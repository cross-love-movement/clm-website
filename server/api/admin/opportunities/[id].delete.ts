import { requirePermission } from '../../../features/auth/guards'
import { deleteRole } from '../../../features/volunteers/repository'

/**
 * Soft-deletes a role. The row and its title stay in place so past applications
 * and assignments still read correctly; the role disappears from every list.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid role id' })

  const deleted = await deleteRole(id)

  if (!deleted) throw createError({ statusCode: 404, statusMessage: 'Role not found' })

  return { message: 'Role deleted.' }
})
