import { STAFF_ROLES } from '#shared/types/auth'

import { parseOrThrow } from '../../utils/validation'
import { resetConfirmSchema } from '../../features/auth/schemas'
import { completePasswordSetup, toSessionUser } from '../../features/auth/service'

/** Accepts an invite or a reset token, sets the password, and signs the user in. */
export default defineEventHandler(async (event) => {
  rateLimit(`auth-confirm:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 10)

  const body = await readBody(event)
  const data = parseOrThrow(resetConfirmSchema, body)

  const user = await completePasswordSetup(data.token, data.password)

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token',
      data: { message: 'That link has expired or has already been used. Request a new one.' },
    })
  }

  const sessionUser = toSessionUser(user)
  await setUserSession(event, { user: sessionUser })

  return {
    user: sessionUser,
    redirect: STAFF_ROLES.includes(sessionUser.role) ? '/admin' : '/portal',
  }
})
