import { VOLUNTEER_STATUSES, type VolunteerStatus } from '#shared/types/volunteers'

import { requirePermission } from '../../../features/auth/guards'
import { listVolunteers } from '../../../features/volunteers/repository'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' && VOLUNTEER_STATUSES.includes(query.status as VolunteerStatus)
      ? (query.status as VolunteerStatus)
      : undefined
  const search = typeof query.q === 'string' ? query.q : undefined

  return listVolunteers({ status, search })
})
