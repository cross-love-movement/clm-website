import { desc } from 'drizzle-orm'

import { useDatabase } from '../../../database/client'
import { users } from '../../../database/schema'
import { requirePermission } from '../../../features/auth/guards'

export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManagePeople')

  const database = useDatabase()
  const rows = await database
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

  return rows
})
