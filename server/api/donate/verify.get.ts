import {
  getDonationByReference,
  markDonationFailed,
  markDonationPaid,
} from '../../features/donations/repository'
import { queueDonationReceipts } from '../../features/donations/notify'
import {
  formatAmount,
  paystackConfigured,
  verifyTransaction,
} from '../../features/donations/paystack'

/**
 * GET /api/donate/verify?reference=CLM-DON-…
 *
 * Called by the thank-you page. Verifying server-side is what makes the
 * callback trustworthy: the query string alone never marks a gift paid.
 */
export default defineEventHandler(async (event) => {
  const raw = getQuery(event).reference
  const reference = typeof raw === 'string' ? raw.trim() : ''

  if (!reference) {
    throw createError({ statusCode: 400, statusMessage: 'Missing reference' })
  }

  const donation = await getDonationByReference(reference)

  if (!donation) {
    throw createError({ statusCode: 404, statusMessage: 'Donation not found' })
  }

  const summary = {
    reference: donation.reference,
    amount: formatAmount(donation.amountPesewas, donation.currency),
    frequency: donation.frequency,
  }

  if (donation.status === 'succeeded') {
    return { ...summary, status: 'succeeded' as const }
  }

  if (!paystackConfigured()) {
    return { ...summary, status: donation.status }
  }

  const transaction = await verifyTransaction(reference)

  if (transaction.status === 'success') {
    const paid = await markDonationPaid(reference, transaction)

    if (paid) await queueDonationReceipts(paid)

    return { ...summary, status: 'succeeded' as const }
  }

  if (transaction.status === 'failed') {
    await markDonationFailed(reference, transaction)

    return { ...summary, status: 'failed' as const }
  }

  return { ...summary, status: 'pending' as const }
})
