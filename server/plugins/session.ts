import { eq } from 'drizzle-orm'

import type { Permission, SessionUser } from '#shared/types/auth'

import { hasDatabase, useDatabase } from '../database/client'
import { users } from '../database/schema'

/**
 * Roles and permissions live in Postgres, but the session is a sealed cookie.
 * Refresh the user from the database whenever the session is fetched so a
 * permission change (or a suspension) applies without waiting for a re-login.
 * The API guards do the same lookup; this keeps the client state in step.
 */
export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session) => {
    const current = session.user as SessionUser | undefined

    if (!current?.id || !hasDatabase()) return

    try {
      const [row] = await useDatabase()
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          permissions: users.permissions,
          status: users.status,
        })
        .from(users)
        .where(eq(users.id, current.id))
        .limit(1)

      if (!row || row.status !== 'active') {
        delete session.user
        return
      }

      session.user = {
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role,
        permissions: row.permissions as Permission[],
      }
    } catch (error) {
      console.error('[auth] could not refresh the session from the database', error)
    }
  })
})
