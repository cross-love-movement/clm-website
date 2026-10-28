import { isStaffRole, type SessionUser } from '#shared/types/auth'

/** The volunteer portal is for volunteers. Staff belong in the staff portal. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch: refreshSession } = useUserSession()

  if (import.meta.client) await refreshSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (isStaffRole((user.value as SessionUser | null)?.role)) {
    return navigateTo('/admin')
  }
})
