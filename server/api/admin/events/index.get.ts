import { requireStaff } from '../../../features/auth/guards'
import { listAllEvents } from '../../../features/events/repository'

/** Every event, including drafts and archived ones. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)

  return listAllEvents()
})
