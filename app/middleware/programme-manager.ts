import { hasPermission, type SessionUser } from '#shared/types/auth'

/** Programme management requires the `canManageProgrammes` permission. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!hasPermission(user.value as SessionUser | null, 'canManageProgrammes')) {
    return navigateTo('/admin')
  }
})
