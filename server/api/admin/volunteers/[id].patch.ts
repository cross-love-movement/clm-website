import { requirePermission } from '../../../features/auth/guards'
import { updateVolunteer } from '../../../features/volunteers/repository'
import { volunteerUpdateSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageVolunteers')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid volunteer id' })

  const body = await readBody(event)
  const input = parseOrThrow(volunteerUpdateSchema, body)
  const updated = await updateVolunteer(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Volunteer not found' })

  return { ok: true }
})
