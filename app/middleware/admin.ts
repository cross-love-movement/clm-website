import { isStaffRole, type SessionUser } from '#shared/types/auth'

/** Staff portal guard. Members are sent to their own portal instead. */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, user, fetch: refreshSession } = useUserSession()

  // Refresh the sealed cookie from Postgres so role and permission changes
  // apply without a re-login.
  if (import.meta.client) await refreshSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const current = user.value as SessionUser | null

  if (!isStaffRole(current?.role)) {
    return navigateTo('/portal')
  }
})
