import { hasPermission, type SessionUser } from '#shared/types/auth'

/** Donation records require the `canManageDonations` permission. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!hasPermission(user.value as SessionUser | null, 'canManageDonations')) {
    return navigateTo('/admin')
  }
})
