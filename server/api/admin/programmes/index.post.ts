import { requirePermission } from '../../../features/auth/guards'
import { createProgramme } from '../../../features/volunteers/repository'
import { programmeInputSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const body = await readBody(event)
  const input = parseOrThrow(programmeInputSchema, body)
  const created = await createProgramme(input)

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create the programme' })
  }

  setResponseStatus(event, 201)
  return { id: created.id, slug: created.slug }
})
