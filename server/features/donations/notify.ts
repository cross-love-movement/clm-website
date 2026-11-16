import { and, eq, isNull } from 'drizzle-orm'

import { useDatabase } from '../../database/client'
import { donations, mailOutbox, type DonationRow } from '../../database/schema'
import { drainOutbox } from '../mail/outbox'
import { receiptMail, staffDonationMail } from './mail'

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

  void drainOutbox().catch((error) => {
    console.error('[mail] donation receipts queued but not sent immediately', error)
  })
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
