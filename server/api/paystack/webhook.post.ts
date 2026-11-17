import {
  cancelLatestForSubscription,
  getDonationByReference,
  markDonationFailed,
  markDonationPaid,
  recordFailedRenewal,
  recordRecurringCharge,
} from '../../features/donations/repository'
import {
  queueCancellationMail,
  queueDonationReceipts,
  queueRenewalFailureMail,
} from '../../features/donations/notify'
import { verifyWebhookSignature, type PaystackWebhookData } from '../../features/donations/paystack'

/**
 * POST /api/paystack/webhook
 *
 * Paystack signs the raw body with the secret key (HMAC-SHA512). Nothing in
 * this route trusts the payload until that signature checks out, and every
 * transition is idempotent so retries are safe.
 */
export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event)
  const signature = getHeader(event, 'x-paystack-signature')

  if (!raw || !verifyWebhookSignature(raw, signature)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  let payload: { event?: string; data?: PaystackWebhookData }

  try {
    payload = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' })
  }

  const data = payload.data

  if (!data) return { received: true }

  if (payload.event === 'charge.success' && data.reference) {
    const known = await getDonationByReference(data.reference)

    if (known) {
      const paid = await markDonationPaid(data.reference, data)
      if (paid) await queueDonationReceipts(paid)
    } else if (data.plan) {
      // A renewal on a monthly plan carries a Paystack-generated reference.
      const recurring = await recordRecurringCharge(data)
      if (recurring) await queueDonationReceipts(recurring)
    }
  }

  if (payload.event === 'charge.failed' && data.reference) {
    await markDonationFailed(data.reference, data)
  }

  // A renewal Paystack could not collect. The repository keeps the record and
  // tells us whether this is the first failure we have seen today; only then
  // does the giving desk get a mail.
  if (payload.event === 'charge.failed' || payload.event === 'invoice.payment_failed') {
    const lapsed = await recordFailedRenewal(data)
    if (lapsed) await queueRenewalFailureMail(lapsed)
  }

  // Cancelled from Paystack's own interface rather than our manage link.
  if (payload.event === 'subscription.not_renew') {
    const code = data.subscription_code ?? data.subscription?.subscription_code

    if (code) {
      const cancelled = await cancelLatestForSubscription(code)
      if (cancelled) await queueCancellationMail(cancelled)
    }
  }

  return { received: true }
})
