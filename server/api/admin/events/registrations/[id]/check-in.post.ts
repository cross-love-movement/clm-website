import { requireStaff } from '../../../../../features/auth/guards'
import { checkInRegistration } from '../../../../../features/events/repository'

/** Marks a confirmed booking as arrived. Idempotent. */
export default defineEventHandler(async (event) => {
  await requireStaff(event)

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid registration id' })

  const row = await checkInRegistration(id)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Confirmed registration not found' })
  }

  return { ok: true, checkedInAt: row.checkedInAt?.toISOString() ?? null }
})
