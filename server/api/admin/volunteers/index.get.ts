import { VOLUNTEER_STATUSES, type VolunteerStatus } from '#shared/types/volunteers'

import { requirePermission } from '../../../features/auth/guards'
import {
  countVolunteers,
  listVolunteers,
  summariseVolunteers,
} from '../../../features/volunteers/repository'
import { parsePage, resolvePage } from '../../../utils/pagination'

/**
 * GET /api/admin/volunteers
 *   ?status=  ?q=  ?page=  ?pageSize=
 *
 * `summary` counts every volunteer, not just this page, so the status chips
 * stay meaningful once the list is paged.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' && VOLUNTEER_STATUSES.includes(query.status as VolunteerStatus)
      ? (query.status as VolunteerStatus)
      : undefined
  const search = typeof query.q === 'string' ? query.q : undefined
  const filter = { status, search }

  const requested = parsePage(event)
  const total = await countVolunteers(filter)
  const pagination = resolvePage(total, requested)
  const volunteers = await listVolunteers({
    ...filter,
    limit: pagination.pageSize,
    offset: pagination.offset,
  })

  return {
    volunteers,
    summary: await summariseVolunteers(),
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    pageCount: pagination.pageCount,
  }
})
