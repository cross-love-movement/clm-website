import { requirePermission } from '../../../../features/auth/guards'
import { resendDonationReceipt } from '../../../../features/donations/notify'

/**
 * POST /api/admin/donations/:id/resend
 *
 * Clears the receipt claim and queues both mails again. Used when a settled
 * donation's receipt never arrived; safe to press more than once.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageDonations')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing donation' })
  }

  const queued = await resendDonationReceipt(id)

  if (!queued) {
    throw createError({
      statusCode: 404,
      statusMessage: 'No settled donation with that id',
    })
  }

  return { ok: true }
})
