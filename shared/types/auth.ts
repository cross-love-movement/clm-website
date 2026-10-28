/** Roles are shared by the database schema, the server, and the client. */
export const USER_ROLES = ['superadmin', 'admin', 'volunteer'] as const

export type UserRole = (typeof USER_ROLES)[number]

/** Roles a superadmin may hand out through an invite. Superadmin is promoted later. */
export const INVITABLE_ROLES = ['admin', 'volunteer'] as const

export type InvitableRole = (typeof INVITABLE_ROLES)[number]

export const USER_STATUSES = ['invited', 'active', 'suspended'] as const

export type UserStatus = (typeof USER_STATUSES)[number]

/** Capabilities assigned per user when they are invited. */
export const PERMISSIONS = [
  'canEdit',
  'canManageRegistrations',
  'canManagePeople',
  'canManageVolunteers',
  'canManageProgrammes',
] as const

export type Permission = (typeof PERMISSIONS)[number]

/** Anyone who may open the staff portal. */
export const STAFF_ROLES: readonly UserRole[] = ['superadmin', 'admin']

export function isStaffRole(role: UserRole | undefined | null) {
  return Boolean(role && STAFF_ROLES.includes(role))
}

export function isSuperadmin(role: UserRole | undefined | null) {
  return role === 'superadmin'
}

/** Admin starts with every operational permission; a superadmin can narrow it. */
export function defaultPermissions(role: UserRole): Permission[] {
  return role === 'admin' ? [...PERMISSIONS] : []
}

interface PermissionHolder {
  role: UserRole
  /** Optional so sessions issued before permissions existed still work. */
  permissions?: readonly Permission[]
}

/** Superadmins pass every check. Everyone else needs the flag. */
export function hasPermission(user: PermissionHolder | null | undefined, permission: Permission) {
  if (!user) return false
  if (user.role === 'superadmin') return true

  return Boolean(user.permissions?.includes(permission))
}

/** Where a signed-in account should land. */
export function portalPathFor(role: UserRole | undefined | null) {
  return isStaffRole(role) ? '/admin' : '/portal'
}

/** One account as returned by the admin users endpoint. */
export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  permissions: Permission[]
  createdAt: string
  lastLoginAt: string | null
}

/** Shape stored in the session cookie. Never includes a password hash. */
export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: Permission[]
}
