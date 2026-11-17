import { and, eq, isNull } from 'drizzle-orm'

import { useDatabase } from '../../database/client'
import { donations, mailOutbox, type DonationRow } from '../../database/schema'
import { drainOutbox } from '../mail/outbox'
import {
  cancellationMail,
  receiptMail,
  refundMail,
  renewalFailedMail,
  staffDonationMail,
} from './mail'

/**
 * Queues both mails once, then drains the outbox immediately.
 *
 * The claim and the outbox insert share one transaction. If writing the rows
 * fails, the claim is rolled back, so a retry can queue the receipt again
 * instead of leaving a settled donation marked as handled with no mail.
 */
export async function queueDonationReceipts(donation: DonationRow) {
  if (donation.status !== 'succeeded') return

  const db = useDatabase()
  const queued = await db.transaction(async (tx) => {
    const [claimed] = await tx
      .update(donations)
      .set({ receiptSentAt: new Date() })
      .where(and(eq(donations.id, donation.id), isNull(donations.receiptSentAt)))
      .returning({ id: donations.id })

    if (!claimed) return false

    await tx.insert(mailOutbox).values([receiptMail(donation), staffDonationMail(donation)])
    return true
  })

  if (!queued) return

  drainSoon('[mail] donation receipts queued but not sent immediately')
}

/**
 * Clears the receipt claim and queues it again. Used by staff when a settled
 * donation's receipt never arrived, including rows claimed by older builds.
 */
export async function resendDonationReceipt(id: string) {
  const db = useDatabase()
  const [row] = await db.select().from(donations).where(eq(donations.id, id)).limit(1)

  if (!row || row.status !== 'succeeded') return false

  await db.update(donations).set({ receiptSentAt: null }).where(eq(donations.id, id))
  await queueDonationReceipts({ ...row, receiptSentAt: null })

  return true
}

/** The donor's confirmation that a monthly gift has been stopped. */
export async function queueCancellationMail(donation: DonationRow) {
  const db = useDatabase()

  await db.insert(mailOutbox).values(cancellationMail(donation))
  drainSoon('[mail] cancellation queued but not sent immediately')
}

/** The donor's confirmation that a gift has been sent back. */
export async function queueRefundMail(donation: DonationRow) {
  const db = useDatabase()

  await db.insert(mailOutbox).values(refundMail(donation))
  drainSoon('[mail] refund queued but not sent immediately')
}

/** Staff notice that a monthly charge did not go through. */
export async function queueRenewalFailureMail(donation: DonationRow) {
  const db = useDatabase()

  await db.insert(mailOutbox).values(
    renewalFailedMail({
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      amountPesewas: donation.amountPesewas,
      currency: donation.currency,
      reference: donation.reference,
      subscriptionCode: donation.subscriptionCode ?? '',
      failedAt: donation.createdAt,
    }),
  )
  drainSoon('[mail] renewal failure queued but not sent immediately')
}

function drainSoon(message: string) {
  void drainOutbox().catch((error) => {
    console.error(message, error)
  })
}
