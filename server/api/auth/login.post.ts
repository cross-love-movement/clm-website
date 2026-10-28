import { parseOrThrow } from '../../utils/validation'
import { loginSchema } from '../../features/auth/schemas'
import { authenticate, toSessionUser } from '../../features/auth/service'
import { STAFF_ROLES } from '#shared/types/auth'

export default defineEventHandler(async (event) => {
  rateLimit(`auth:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 10)

  const body = await readBody(event)
  const data = parseOrThrow(loginSchema, body)

  const user = await authenticate(data.email, data.password)

  if (!user) {
    // Same message for unknown email, wrong password, and suspended account.
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
      data: { message: 'Invalid email or password.' },
    })
  }

  const sessionUser = toSessionUser(user)
  await setUserSession(event, { user: sessionUser })

  return {
    user: sessionUser,
    redirect: STAFF_ROLES.includes(sessionUser.role) ? '/admin' : '/portal',
  }
})
