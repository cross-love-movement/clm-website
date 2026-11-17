import { requirePermission } from '../../../../features/auth/guards'
import { recordAudit } from '../../../../features/audit/repository'
import { queueRefundMail } from '../../../../features/donations/notify'
import {
  getDonationById,
  markDonationRefunded,
  toDonationSummary,
} from '../../../../features/donations/repository'

/**
 * POST /api/admin/donations/:id/refund
 *
 * Records a refund that staff have already issued in Paystack. The app never
 * moves money: Paystack holds the card details, so a refund is started there
 * and this route is what keeps the books and the donor's record in step.
 */
export default defineEventHandler(async (event) => {
  const actor = await requirePermission(event, 'canManageDonations')

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing donation' })
  }

  const donation = await getDonationById(id)

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Donation not found' })
  }

  if (donation.status === 'refunded') {
    return { donation: toDonationSummary(donation), already: true }
  }

  if (donation.status !== 'succeeded') {
    throw createError({
      statusCode: 409,
      statusMessage: 'Only a settled gift can be marked refunded',
      data: { message: 'Nothing was collected on this record, so there is nothing to send back.' },
    })
  }

  const refunded = await markDonationRefunded(donation.id)

  // A second click loses the race; the first one queued the donor's mail.
  if (!refunded) {
    const current = (await getDonationById(donation.id)) ?? donation
    return { donation: toDonationSummary(current), already: true }
  }

  await queueRefundMail(refunded)

  await recordAudit(actor, {
    action: 'donation.refunded',
    entity: 'donation',
    entityId: refunded.id,
    summary: `Marked ${refunded.reference} refunded and emailed the donor.`,
    metadata: { reference: refunded.reference, amountPesewas: refunded.amountPesewas },
  })

  return { donation: toDonationSummary(refunded), already: false }
})
