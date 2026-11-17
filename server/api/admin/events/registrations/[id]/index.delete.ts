import { recordAudit } from '../../../../../features/audit/repository'
import { requirePermission } from '../../../../../features/auth/guards'
import { cancelRegistration } from '../../../../../features/events/repository'

/** Cancels a booking and promotes waitlisted bookings into the freed seats. */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManageRegistrations')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid registration id' })

  const result = await cancelRegistration(id)

  if (!result.ok) {
    throw createError({ statusCode: 404, statusMessage: 'Registration not found' })
  }

  await recordAudit(actor, {
    action: 'registration.cancelled',
    entity: 'registration',
    entityId: id,
    summary: `Released a booking${result.promoted.length ? ` and promoted ${result.promoted.length} from the waitlist` : ''}.`,
    metadata: { promoted: result.promoted.length },
  })

  return { ok: true, promoted: result.promoted.length }
})
