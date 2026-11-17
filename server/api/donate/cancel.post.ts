import { getDonationByReference, markDonationCancelled } from '../../features/donations/repository'
import { verifyDonationCancelToken } from '../../features/donations/cancel'
import { queueCancellationMail } from '../../features/donations/notify'
import {
  disableSubscription,
  formatAmount,
  getSubscription,
  paystackConfigured,
} from '../../features/donations/paystack'
import { MAILBOXES } from '../../utils/mailboxes'

/**
 * POST /api/donate/cancel
 *
 * Stops a monthly gift. The link in the receipt carries an HMAC of the
 * reference, so the donor needs no account. The browser only posts; nothing
 * here trusts the query string on its own, and a link that a mail scanner
 * fetches cannot cancel a gift because GET never reaches this route.
 */
export default defineEventHandler(async (event) => {
  const data = parseOrThrow(donationCancelSchema, await readBody(event))

  rateLimit(`donate-cancel:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 10)

  if (!verifyDonationCancelToken(data.reference, data.token)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'That manage link is not valid',
      data: { message: `Ask the giving team for a fresh link: ${MAILBOXES.donations}` },
    })
  }

  const donation = await getDonationByReference(data.reference)

  if (!donation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'We could not find that gift',
      data: { message: 'Check the reference in your receipt, or email the giving team.' },
    })
  }

  if (donation.frequency !== 'monthly') {
    throw createError({
      statusCode: 409,
      statusMessage: 'That gift was a one-time gift',
      data: { message: 'There is no monthly gift to stop. Nothing further will be charged.' },
    })
  }

  const summary = {
    reference: donation.reference,
    amount: formatAmount(donation.amountPesewas, donation.currency),
  }

  if (donation.cancelledAt) return { ...summary, cancelled: true, already: true }

  if (!donation.subscriptionCode) {
    throw createError({
      statusCode: 409,
      statusMessage: 'We could not match that gift to a subscription',
      data: {
        message: `Email ${MAILBOXES.donations} with your reference and we will stop it by hand.`,
      },
    })
  }

  if (!paystackConfigured()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'The giving desk is not reachable right now',
      data: {
        message: `Email ${MAILBOXES.donations} with your reference and we will stop it by hand.`,
      },
    })
  }

  const subscription = await getSubscription(donation.subscriptionCode)
  const stopped = subscription.status === 'cancelled' || subscription.status === 'non-renewing'

  if (!stopped) {
    const emailToken = subscription.email_token?.trim()

    if (!emailToken) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Paystack did not return the token for that subscription',
        data: {
          message: `Email ${MAILBOXES.donations} with your reference and we will stop it by hand.`,
        },
      })
    }

    await disableSubscription(donation.subscriptionCode, emailToken)
  }

  const cancelled = await markDonationCancelled(donation.id)

  // A second click on the same link loses the race, and the first click mails
  // the donor. Treat it as done rather than erroring.
  if (!cancelled) return { ...summary, cancelled: true, already: true }

  await queueCancellationMail(cancelled)

  return { ...summary, cancelled: true, already: stopped }
})
