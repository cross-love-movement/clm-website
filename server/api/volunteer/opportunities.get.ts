import { hasDatabase } from '../../database/client'
import { listOpenRoles } from '../../features/volunteers/repository'

/** Public: every open role on a planned or active programme. */
export default defineEventHandler(async () => {
  if (!hasDatabase()) return []

  return listOpenRoles()
})
