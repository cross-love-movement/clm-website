import { requirePermission } from '../../../features/auth/guards'
import { createAssignment } from '../../../features/volunteers/repository'
import { assignmentInputSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManageVolunteers')

  const body = await readBody(event)
  const input = parseOrThrow(assignmentInputSchema, body)
  const created = await createAssignment(input, actor.id)

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create the assignment' })
  }

  setResponseStatus(event, 201)
  return { id: created.id }
})
