/** Roles are shared by the database schema, the server, and the client. */
export const USER_ROLES = ['superadmin', 'admin', 'editor', 'viewer', 'member'] as const

export type UserRole = (typeof USER_ROLES)[number]

/** Anyone who may open the staff portal. */
export const STAFF_ROLES: readonly UserRole[] = ['superadmin', 'admin', 'editor', 'viewer']

/** Staff who may create and change records. Viewers only read. */
export const CONTENT_ROLES: readonly UserRole[] = ['superadmin', 'admin', 'editor']

export function isStaffRole(role: UserRole | undefined | null) {
  return Boolean(role && STAFF_ROLES.includes(role))
}

export function canEditContent(role: UserRole | undefined | null) {
  return Boolean(role && CONTENT_ROLES.includes(role))
}

/** Shape stored in the session cookie. Never includes a password hash. */
export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}
