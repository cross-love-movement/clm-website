import { requirePermission } from '../../../features/auth/guards'
import { createRole } from '../../../features/volunteers/repository'
import { opportunityInputSchema } from '../../../features/volunteers/schemas'
import { parseOrThrow } from '../../../utils/validation'

/** Create a role in the catalogue. Programmes attach roles separately. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageProgrammes')

  const input = parseOrThrow(opportunityInputSchema, await readBody(event))
  const created = await createRole(input)

  if (!created) {
    throw createError({ statusCode: 500, statusMessage: 'Could not create the role' })
  }

  setResponseStatus(event, 201)
  return { id: created.id }
})
