import { requireAnyPermission } from '../../../../features/auth/guards'
import { listEventNeeds } from '../../../../features/volunteers/repository'

/** The volunteer line-up for one event, as the event page shows it. */
export default defineEventHandler(async (event) => {
  await requireAnyPermission(event, ['canManageProgrammes', 'canManageVolunteers'])

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid event id' })

  return listEventNeeds(id)
})
