import { parseOrThrow } from '../../utils/validation'
import { sendPasswordResetEmail } from '../../features/auth/mail'
import { resetRequestSchema } from '../../features/auth/schemas'
import { requestPasswordReset } from '../../features/auth/service'

/**
 * Always answers the same way, whether or not the address exists. This is what
 * keeps the endpoint from being used to discover who has an account.
 */
export default defineEventHandler(async (event) => {
  rateLimit(`auth-reset:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const body = await readBody(event)
  const data = parseOrThrow(resetRequestSchema, body)
  const result = await requestPasswordReset(data.email)

  if (result) {
    await sendPasswordResetEmail(event, {
      to: result.user.email,
      name: result.user.name,
      token: result.token,
    })
  }

  return {
    message: 'If that email has an account, a reset link is on its way. Check your inbox.',
  }
})
