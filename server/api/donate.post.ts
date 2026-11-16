import { hasDatabase } from '../database/client'
import { sanitizeSubject, siteUrl } from '../emails/catalog'
import { donationVariables } from '../emails/notifications'
import {
  createPendingDonation,
  markDonationFailed,
  planCodeFor,
} from '../features/donations/repository'
import {
  donationReference,
  formatAmount,
  initializeTransaction,
  paystackConfigured,
} from '../features/donations/paystack'
import { MAILBOXES } from '../utils/mailboxes'

/**
 * POST /api/donate
 *
 * Starts a gift. The server owns the amount and the reference; the browser is
 * sent to Paystack's hosted checkout and never sees a secret.
 *
 * Without Paystack keys (preview, local dev) this falls back to the original
 * pledge behaviour so the page is never a dead end.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { mode: 'pledge' as const, message: 'Thank you — your gift has been recorded.' }
  }

  rateLimit(`donate:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 5)

  const data = parseOrThrow(donationSchema, body)
  const amountPesewas = Math.round(data.amount * 100)
  const amount = formatAmount(amountPesewas)
  const frequency = data.frequency === 'monthly' ? 'monthly' : 'one_time'

  if (!paystackConfigured() || !hasDatabase()) {
    await sendMail({
      tag: 'donation',
      to: MAILBOXES.donations,
      replyTo: data.email,
      subject: sanitizeSubject(`Giving interest — ${amount} ${data.frequency} — ${data.name}`),
      text: [
        'Someone has registered giving interest on the website.',
        '',
        `Name:      ${data.name}`,
        `Email:     ${data.email}`,
        `Amount:    ${amount}`,
        `Frequency: ${data.frequency}`,
        '',
        'Note:',
        data.note || '—',
        '',
        'Send transfer details and confirm the giving schedule.',
      ].join('\n'),
      variables: donationVariables({
        name: data.name,
        email: data.email,
        amount,
        frequency: data.frequency,
        note: data.note,
      }),
    })

    return {
      mode: 'pledge' as const,
      message: `Thank you. We have recorded your ${
        data.frequency === 'monthly' ? 'monthly' : 'one-time'
      } gift of ${amount} and will email transfer details and a receipt within two working days.`,
    }
  }

  const reference = donationReference()

  try {
    const planCode = frequency === 'monthly' ? await planCodeFor(amountPesewas) : null

    await createPendingDonation({
      reference,
      amountPesewas,
      frequency,
      donorName: data.name,
      donorEmail: data.email,
      note: data.note,
      planCode,
    })

    const initialized = await initializeTransaction({
      email: data.email,
      amountPesewas,
      reference,
      callbackUrl: `${siteUrl()}/donate/complete`,
      planCode,
      metadata: { reference, frequency, source: 'website' },
    })

    return {
      mode: 'redirect' as const,
      reference,
      authorizationUrl: initialized.authorization_url,
    }
  } catch (error) {
    await markDonationFailed(reference, {})
    throw error
  }
})
