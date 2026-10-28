import { hasPermission, type SessionUser } from '#shared/types/auth'

/** People management requires the `canManagePeople` permission. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const current = user.value as SessionUser | null

  if (!hasPermission(current, 'canManagePeople')) {
    return navigateTo('/admin')
  }
})
