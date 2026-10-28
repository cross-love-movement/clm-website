import { requirePermission } from '../../../features/auth/guards'
import { updateProgramme } from '../../../features/volunteers/repository'
import { programmeInputSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid programme id' })

  const body = await readBody(event)
  const input = parseOrThrow(programmeInputSchema, body)
  const updated = await updateProgramme(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Programme not found' })

  return { id: updated.id, slug: updated.slug }
})
