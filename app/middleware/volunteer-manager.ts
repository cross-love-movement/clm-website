import { hasPermission, type SessionUser } from '#shared/types/auth'

/** Volunteer management requires the `canManageVolunteers` permission. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!hasPermission(user.value as SessionUser | null, 'canManageVolunteers')) {
    return navigateTo('/admin')
  }
})
