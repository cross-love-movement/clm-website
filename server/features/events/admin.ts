import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * Admin routes are protected by a bearer token, not a session.
 * Set `NUXT_REGISTRATIONS_TOKEN` to a long random string.
 */
export function requireRegistrationsToken(event: H3Event) {
  const token = useRuntimeConfig(event).registrationsToken

  if (!token) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Registrations export is not configured',
      data: { message: 'Set NUXT_REGISTRATIONS_TOKEN to enable this endpoint.' },
    })
  }

  const header = getHeader(event, 'authorization')
  const provided =
    header?.startsWith('Bearer ') === true
      ? header.slice('Bearer '.length).trim()
      : (getHeader(event, 'x-admin-token') ?? '')

  const expected = Buffer.from(token)
  const actual = Buffer.from(provided)
  const matches = expected.length === actual.length && timingSafeEqual(expected, actual)

  if (!matches) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorised' })
  }
}
