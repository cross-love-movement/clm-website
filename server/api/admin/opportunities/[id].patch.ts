import { requirePermission } from '../../../features/auth/guards'
import { updateOpportunity } from '../../../features/volunteers/repository'
import { opportunityInputSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid opportunity id' })

  const body = await readBody(event)
  const input = parseOrThrow(opportunityInputSchema, body)
  const updated = await updateOpportunity(id, input)

  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Opportunity not found' })

  return { id: updated.id }
})
