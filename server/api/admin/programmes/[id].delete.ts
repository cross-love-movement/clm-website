import { recordAudit } from '../../../features/audit/repository'
import { requirePermission } from '../../../features/auth/guards'
import { deleteProgramme } from '../../../features/volunteers/repository'

/**
 * DELETE /api/admin/programmes/:id
 *
 * Only for a programme nothing has happened to yet. A programme with volunteer
 * placements or applications is a record about people, so it is archived
 * (`status: archived`) instead of deleted.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid programme id' })

  const result = await deleteProgramme(id)

  if (!result.ok) {
    if (result.reason === 'not-found') {
      throw createError({ statusCode: 404, statusMessage: 'Programme not found' })
    }

    const parts = [
      result.assignments
        ? `${result.assignments} placement${result.assignments === 1 ? '' : 's'}`
        : '',
      result.applications
        ? `${result.applications} application${result.applications === 1 ? '' : 's'}`
        : '',
    ].filter(Boolean)

    throw createError({
      statusCode: 409,
      statusMessage: 'This programme is in use',
      data: {
        message: `It has ${parts.join(' and ')}, so it is kept as a record. Set its status to archived instead.`,
      },
    })
  }

  await recordAudit(actor, {
    action: 'programme.deleted',
    entity: 'programme',
    entityId: id,
    summary: `Deleted the programme “${result.title}”, which had no placements or applications.`,
    metadata: { title: result.title },
  })

  return { message: 'Programme deleted.' }
})
