import { requirePermission } from '../../../features/auth/guards'
import { updateAssignment } from '../../../features/volunteers/repository'
import { assignmentUpdateSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid assignment id' })

  const body = await readBody(event)
  const input = parseOrThrow(assignmentUpdateSchema, body)
  const updated = await updateAssignment(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Assignment not found' })

  return { ok: true }
})
