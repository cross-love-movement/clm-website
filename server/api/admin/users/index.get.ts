import { desc } from 'drizzle-orm'

import { useDatabase } from '../../../database/client'
import { users } from '../../../database/schema'
import { requireAdmin } from '../../../features/auth/guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const database = useDatabase()
  const rows = await database
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))

  return rows
})
