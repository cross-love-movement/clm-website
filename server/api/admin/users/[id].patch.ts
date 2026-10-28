import { eq } from 'drizzle-orm'

import {
  defaultPermissions,
  type Permission,
  type UserRole,
  type UserStatus,
} from '#shared/types/auth'

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

  if (id === actor.id && data.status === 'suspended') {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot suspend your own account.',
    })
  }

  if (Object.keys(data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })
  }

  const patch: {
    role?: UserRole
    status?: UserStatus
    permissions?: Permission[]
    updatedAt: Date
  } = { ...data, updatedAt: new Date() }

  if (data.role) {
    // Permissions only mean something for admins; superadmin is implicit.
    patch.permissions =
      data.role === 'admin' ? (data.permissions ?? defaultPermissions('admin')) : []
  }

  const database = useDatabase()
  const [updated] = await database.update(users).set(patch).where(eq(users.id, id)).returning({
    id: users.id,
    email: users.email,
    role: users.role,
    status: users.status,
    permissions: users.permissions,
  })

  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return updated
})
