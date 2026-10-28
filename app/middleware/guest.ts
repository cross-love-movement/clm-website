import { portalPathFor, type SessionUser } from '#shared/types/auth'

/** Signed-in users skip the login screen and land in their own portal. */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  if (!loggedIn.value) return

  const target = to.query.redirect
  const redirect =
    typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : ''

  return navigateTo(redirect || portalPathFor((user.value as SessionUser | null)?.role))
})
