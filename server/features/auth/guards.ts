import type { H3Event } from 'h3'

import { STAFF_ROLES, type SessionUser, type UserRole } from '#shared/types/auth'

/**
 * `requireUserSession` throws 401 when there is no valid session. The session
 * payload is written by `setUserSession` at login and contains only the fields
 * in `SessionUser` — never a password hash.
 */
export async function requireSessionUser(event: H3Event): Promise<SessionUser> {
  const { user } = await requireUserSession(event)

  return user as SessionUser
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

/** Staff management (inviting, roles, suspension). */
export function requireAdmin(event: H3Event) {
  return requireRole(event, ['superadmin', 'admin'])
}

export function requireSuperadmin(event: H3Event) {
  return requireRole(event, ['superadmin'])
}
