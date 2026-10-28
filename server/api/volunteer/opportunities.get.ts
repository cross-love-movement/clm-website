import { hasDatabase } from '../../database/client'
import { listOpenProgrammes } from '../../features/volunteers/repository'

/** Public: programmes and roles a visitor can apply for. */
export default defineEventHandler(async () => {
  if (!hasDatabase()) return []

  return listOpenProgrammes()
})
