import { requireAnyPermission } from '../../../features/auth/guards'
import { listProgrammes } from '../../../features/volunteers/repository'

export default defineEventHandler(async (event) => {
  await requireAnyPermission(event, ['canManageProgrammes', 'canManageVolunteers'])

  return listProgrammes()
})
