import { canManageMail, type SessionUser } from '#shared/types/auth'

/** The mail outbox is available to anyone with an operational permission. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  if (!canManageMail(user.value as SessionUser | null)) {
    return navigateTo('/admin')
  }
})
