import type { H3Event } from 'h3'
import { eq } from 'drizzle-orm'

import {
  STAFF_ROLES,
  hasPermission,
  type Permission,
  type SessionUser,
  type UserRole,
} from '#shared/types/auth'

import { hasDatabase, useDatabase } from '../../database/client'
import { users } from '../../database/schema'

/**
 * `requireUserSession` throws 401 when there is no valid session. The session
 * payload is written by `setUserSession` at login and contains only the fields
 * in `SessionUser` — never a password hash.
 */
export async function requireSessionUser(event: H3Event): Promise<SessionUser> {
  const { user } = await requireUserSession(event)
  const sessionUser = user as SessionUser

  if (!hasDatabase()) return sessionUser

  // The cookie is sealed at login, so re-read the account. This makes role,
  // permission, and suspension changes take effect immediately.
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
    .where(eq(users.id, sessionUser.id))
    .limit(1)

  if (!row || row.status !== 'active') {
    throw createError({ statusCode: 403, statusMessage: 'Account is not active' })
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    permissions: row.permissions as Permission[],
  }
}

export async function requireRole(
  event: H3Event,
  roles: readonly UserRole[],
): Promise<SessionUser> {
  const user = await requireSessionUser(event)

  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}

export function requireStaff(event: H3Event) {
  return requireRole(event, STAFF_ROLES)
}

/** Superadmins pass automatically; admins need the flag on their account. */
export async function requirePermission(
  event: H3Event,
  permission: Permission,
): Promise<SessionUser> {
  const user = await requireSessionUser(event)

  if (!hasPermission(user, permission)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}

/** For shared read screens used by more than one role. */
export async function requireAnyPermission(
  event: H3Event,
  permissions: readonly Permission[],
): Promise<SessionUser> {
  const user = await requireSessionUser(event)

  if (!permissions.some((permission) => hasPermission(user, permission))) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  return user
}

export function requireSuperadmin(event: H3Event) {
  return requireRole(event, ['superadmin'])
}
