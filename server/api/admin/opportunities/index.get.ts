import { requirePermission } from '../../../features/auth/guards'
import { listRoles } from '../../../features/volunteers/repository'

/** Every live role in the catalogue, for the staff list. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  return listRoles()
})
