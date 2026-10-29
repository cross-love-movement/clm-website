import type { AdminEvent, AdminRegistration } from '#shared/types/content'
import type { UserRole, UserStatus, Permission } from '#shared/types/auth'

/** Shared presentation helpers for the staff portal screens. */

export type PublishStatus = AdminEvent['status']
export type BookingStatus = AdminRegistration['status']

const publishTones: Record<PublishStatus, string> = {
  published: 'bg-brand-100 text-brand-800',
  draft: 'bg-sand-200 text-ink-soft',
  archived: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
}

const bookingTones: Record<BookingStatus, string> = {
  confirmed: 'bg-brand-100 text-brand-800',
  waitlisted: 'bg-gold-100 text-gold-800',
  cancelled: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
}

export function publishTone(status: PublishStatus) {
  return publishTones[status]
}

export function bookingTone(status: BookingStatus) {
  return bookingTones[status]
}

/** Percentage of capacity taken, clamped for the progress bar. */
export function occupancyPercent(registered: number, capacity: number) {
  if (capacity <= 0) return registered > 0 ? 100 : 0

  return Math.min(100, Math.round((registered / capacity) * 100))
}

const roleLabels: Record<UserRole, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  volunteer: 'Volunteer',
}

const userStatusTones: Record<UserStatus, string> = {
  active: 'bg-brand-100 text-brand-800',
  invited: 'bg-gold-100 text-gold-800',
  suspended: 'bg-clay-50 text-clay-700 ring-1 ring-clay-200',
}

export function userRoleLabel(role: UserRole) {
  return roleLabels[role]
}

export function userStatusTone(status: UserStatus) {
  return userStatusTones[status]
}

const permissionLabels: Record<Permission, string> = {
  canEdit: 'Edit events',
  canManageRegistrations: 'Manage registrations',
  canManagePeople: 'Manage people',
  canManageVolunteers: 'Manage volunteers',
  canManageProgrammes: 'Manage programmes',
}

export function permissionLabel(permission: Permission) {
  return permissionLabels[permission]
}
