import { requirePermission } from '../../../../../features/auth/guards'
import { cancelRegistration } from '../../../../../features/events/repository'

/** Cancels a booking and promotes waitlisted bookings into the freed seats. */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageRegistrations')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid registration id' })

  const result = await cancelRegistration(id)

  if (!result.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  return { ok: true, promoted: result.promoted.length }
})
