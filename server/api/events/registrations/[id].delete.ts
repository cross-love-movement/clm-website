import { requireRegistrationsToken } from '../../../features/events/admin'
import { cancelRegistration } from '../../../features/events/repository'

/** Cancel a booking and release its seats. The row is kept for the record. */
export default defineEventHandler((event) => {
  requireRegistrationsToken(event)

  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid registration id' })
  }

  if (!cancelRegistration(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  return { ok: true }
})
