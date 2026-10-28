import { requirePermission } from '../../../../features/auth/guards'
import { createOpportunity } from '../../../../features/volunteers/repository'
import { opportunityInputSchema } from '../../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid programme id' })

  const body = await readBody(event)
  const input = parseOrThrow(opportunityInputSchema, body)
  const created = await createOpportunity(id, input)

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create the opportunity' })
  }

  setResponseStatus(event, 201)
  return { id: created.id }
})
