import { AUDIT_ENTITIES, type AuditEntity } from '#shared/types/audit'

import { countAudit, listAudit } from '../../../features/audit/repository'
import { requirePermission } from '../../../features/auth/guards'
import { parsePage, resolvePage } from '../../../utils/pagination'

/**
 * GET /api/admin/audit
 *   ?entity=  ?search=  ?page=  ?pageSize=
 *
 * Read-only. The trail is written by the routes that change things, so there
 * is deliberately no way to edit or delete an entry from the app.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManagePeople')

  const query = getQuery(event)
  const entity =
    typeof query.entity === 'string' && AUDIT_ENTITIES.includes(query.entity as AuditEntity)
      ? (query.entity as AuditEntity)
      : undefined
  const search = typeof query.search === 'string' ? query.search : undefined
  const filter = { entity, search }

  const requested = parsePage(event, 50)
  const total = await countAudit(filter)
  const pagination = resolvePage(total, requested)
  const entries = await listAudit({
    ...filter,
    limit: pagination.pageSize,
    offset: pagination.offset,
  })

  return {
    entries,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    pageCount: pagination.pageCount,
  }
})
