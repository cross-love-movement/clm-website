import { eq } from 'drizzle-orm'

import { useDatabase } from '../../../database/client'
import { users } from '../../../database/schema'
import { requireSuperadmin } from '../../../features/auth/guards'
import { userUpdateSchema } from '../../../features/auth/schemas'
import { parseOrThrow } from '../../../utils/validation'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Change a role or suspend an account. Superadmin only. */
export default defineEventHandler(async (event) => {
  const actor = await requireSuperadmin(event)

  const id = getRouterParam(event, 'id')

  if (!id || !UUID.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }

  const body = await readBody(event)
  const data = parseOrThrow(userUpdateSchema, body)

  if (id === actor.id && data.role && data.role !== 'superadmin') {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot remove your own superadmin role.',
    })
  }

  if (Object.keys(data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const database = useDatabase()
  const [updated] = await database
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, role: users.role, status: users.status })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return updated
})
