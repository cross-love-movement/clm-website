import { desc } from 'drizzle-orm'

import { useDatabase } from '../../../database/client'
import { users } from '../../../database/schema'
import { requirePermission } from '../../../features/auth/guards'

/**
 * The staff directory is small and the page needs every row for its role and
 * status counts, so this returns the list whole rather than paging it.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManagePeople')

  const database = useDatabase()

  return await database
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      permissions: users.permissions,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
})
