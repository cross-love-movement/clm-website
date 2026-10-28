import { isStaffRole, type SessionUser } from '#shared/types/auth'

/** Staff portal guard. Members are sent to their own portal instead. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  const current = user.value as SessionUser | null

  if (!isStaffRole(current?.role)) {
    return navigateTo('/portal')
  }
})
