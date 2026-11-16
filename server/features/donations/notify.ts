import type { DonationRow } from '../../database/schema'
import { useDatabase } from '../../database/client'
import { mailOutbox } from '../../database/schema'
import { drainOutbox } from '../mail/outbox'
import { claimDonationReceipt } from './repository'
import { receiptMail, staffDonationMail } from './mail'

/** Queues both mails once, then drains the outbox immediately. */
export async function queueDonationReceipts(donation: DonationRow) {
  if (donation.status !== 'succeeded') return
  if (!(await claimDonationReceipt(donation.id))) return

  const db = useDatabase()
  await db.insert(mailOutbox).values([receiptMail(donation), staffDonationMail(donation)])

  void drainOutbox().catch((error) => {
    console.error('[mail] donation receipts queued but not sent immediately', error)
  })
}
