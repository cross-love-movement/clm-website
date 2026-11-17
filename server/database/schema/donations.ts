import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

/** `succeeded` and `paidAt` are only set from a verified Paystack response. */
export const donationStatus = pgEnum('donation_status', [
  'pending',
  'succeeded',
  'failed',
  'abandoned',
  'refunded',
])

export const donationFrequency = pgEnum('donation_frequency', ['one_time', 'monthly'])

/**
 * One gift, one row. The reference is ours and is also sent to Paystack, so a
 * retried webhook cannot create or settle the same gift twice.
 */
export const donations = pgTable(
  'donations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    reference: text('reference').notNull().unique(),
    status: donationStatus('status').notNull().default('pending'),
    /** Minor units: GH₵50 is 5000. Paystack's own unit. */
    amountPesewas: integer('amount_pesewas').notNull(),
    currency: text('currency').notNull().default('GHS'),
    frequency: donationFrequency('frequency').notNull().default('one_time'),
    donorName: text('donor_name').notNull(),
    donorEmail: text('donor_email').notNull(),
    donorPhone: text('donor_phone').notNull().default(''),
    note: text('note').notNull().default(''),
    /** card | mobile_money | bank | undefined until the charge succeeds. */
    channel: text('channel'),
    planCode: text('plan_code'),
    customerCode: text('customer_code'),
    subscriptionCode: text('subscription_code'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    receiptSentAt: timestamp('receipt_sent_at', { withTimezone: true }),
    /**
     * When the donor stopped a monthly gift. The payment status is left alone:
     * the charges that were collected are still money received.
     */
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    /** Raw verify/webhook body, kept for reconciliation and disputes. */
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('donations_status_created_idx').on(table.status, table.createdAt),
    index('donations_email_idx').on(table.donorEmail),
    check('donation_amount_positive', sql`${table.amountPesewas} > 0`),
  ],
)

/**
 * Paystack plans are fixed-amount, so a monthly gift of a new amount needs a
 * plan created once and reused by every donor who picks that amount.
 */
export const donationPlans = pgTable('donation_plans', {
  amountPesewas: integer('amount_pesewas').primaryKey(),
  code: text('code').notNull().unique(),
  currency: text('currency').notNull().default('GHS'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type DonationRow = typeof donations.$inferSelect
export type DonationPlanRow = typeof donationPlans.$inferSelect
