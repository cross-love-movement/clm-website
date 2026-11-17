import { and, count, desc, eq, gt, ilike, isNull, ne, or, sum } from 'drizzle-orm'

import type { DonationStatus, DonationSummary, DonationTotals } from '#shared/types/donations'

import { useDatabase } from '../../database/client'
import { donationPlans, donations, type DonationRow } from '../../database/schema'
import { createMonthlyPlan, type PaystackTransaction } from './paystack'

function iso(value: Date | null) {
  return value ? value.toISOString() : null
}

export function toDonationSummary(row: DonationRow): DonationSummary {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    amountPesewas: row.amountPesewas,
    currency: row.currency,
    frequency: row.frequency,
    donorName: row.donorName,
    donorEmail: row.donorEmail,
    note: row.note,
    channel: row.channel,
    paidAt: iso(row.paidAt),
    cancelledAt: iso(row.cancelledAt),
    createdAt: row.createdAt.toISOString(),
  }
}

export interface NewDonationInput {
  reference: string
  amountPesewas: number
  frequency: 'one_time' | 'monthly'
  donorName: string
  donorEmail: string
  note: string
  planCode?: string | null
}

export async function createPendingDonation(input: NewDonationInput) {
  const db = useDatabase()
  const [row] = await db
    .insert(donations)
    .values({
      reference: input.reference,
      amountPesewas: input.amountPesewas,
      frequency: input.frequency,
      donorName: input.donorName,
      donorEmail: input.donorEmail.trim().toLowerCase(),
      note: input.note,
      planCode: input.planCode ?? null,
    })
    .returning()

  if (!row) {
    throw createError({ statusCode: 500, statusMessage: 'Could not start that gift' })
  }

  return row
}

export async function getDonationByReference(reference: string) {
  const db = useDatabase()
  const [row] = await db.select().from(donations).where(eq(donations.reference, reference)).limit(1)

  return row ?? null
}

/**
 * Settles a donation. The `status <> succeeded` guard makes a retried webhook
 * and the browser callback collapse into one transition.
 */
export async function markDonationPaid(reference: string, payload: PaystackTransaction) {
  const db = useDatabase()
  const [row] = await db
    .update(donations)
    .set({
      status: 'succeeded',
      paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
      channel: payload.channel ?? null,
      customerCode: payload.customer?.customer_code ?? null,
      subscriptionCode: payload.subscription?.subscription_code ?? null,
      payload: payload as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(and(eq(donations.reference, reference), ne(donations.status, 'succeeded')))
    .returning()

  return row ?? (await getDonationByReference(reference))
}

export async function markDonationFailed(reference: string, payload: PaystackTransaction) {
  const db = useDatabase()

  await db
    .update(donations)
    .set({
      status: 'failed',
      channel: payload.channel ?? null,
      payload: payload as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(and(eq(donations.reference, reference), eq(donations.status, 'pending')))
}

/**
 * A monthly plan charges the donor again with a Paystack-generated reference.
 * Those charges have no pending row of ours, so they are recorded here.
 */
export async function recordRecurringCharge(payload: PaystackTransaction) {
  const reference = payload.reference?.trim()
  const amount = payload.amount ?? 0
  const email = payload.customer?.email?.trim().toLowerCase()

  if (!reference || amount <= 0 || !email) return null

  const db = useDatabase()
  const name =
    [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ').trim() ||
    email

  const [row] = await db
    .insert(donations)
    .values({
      reference,
      status: 'succeeded',
      amountPesewas: amount,
      currency: payload.currency ?? 'GHS',
      frequency: 'monthly',
      donorName: name,
      donorEmail: email,
      channel: payload.channel ?? null,
      planCode:
        typeof payload.plan === 'object' && payload.plan ? (payload.plan.plan_code ?? null) : null,
      customerCode: payload.customer?.customer_code ?? null,
      subscriptionCode: payload.subscription?.subscription_code ?? null,
      paidAt: payload.paid_at ? new Date(payload.paid_at) : new Date(),
      payload: payload as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing({ target: donations.reference })
    .returning()

  return row ?? null
}

/**
 * Stops the clock on a monthly gift. Only the cancellation timestamp moves: the
 * charges already collected stay `succeeded`, so totals stay honest.
 */
export async function markDonationCancelled(id: string) {
  const db = useDatabase()
  const [row] = await db
    .update(donations)
    .set({ cancelledAt: new Date(), updatedAt: new Date() })
    .where(and(eq(donations.id, id), isNull(donations.cancelledAt)))
    .returning()

  return row ?? null
}

/** Mirrors a cancellation that happened inside Paystack, keyed by subscription. */
export async function cancelLatestForSubscription(subscriptionCode: string) {
  const code = subscriptionCode.trim()
  if (!code) return null

  const db = useDatabase()
  const [row] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(and(eq(donations.subscriptionCode, code), eq(donations.status, 'succeeded')))
    .orderBy(desc(donations.createdAt))
    .limit(1)

  return row ? markDonationCancelled(row.id) : null
}

interface RenewalFailure {
  reference: string
  amountPesewas: number
  subscriptionCode: string
  donorName: string
  donorEmail: string
}

function renewalFailureOf(payload: PaystackTransaction): RenewalFailure | null {
  const subscriptionCode =
    typeof payload.subscription === 'object' && payload.subscription
      ? payload.subscription.subscription_code?.trim()
      : undefined
  const reference = payload.reference?.trim()
  const email = payload.customer?.email?.trim().toLowerCase()
  const amount = payload.amount ?? 0

  if (!subscriptionCode || !reference || !email || amount <= 0) return null

  const name =
    [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ').trim() ||
    email

  return {
    reference,
    amountPesewas: amount,
    subscriptionCode,
    donorName: name,
    donorEmail: email,
  }
}

/**
 * A renewal that Paystack could not collect. The row is recorded so the giving
 * desk can see the lapse, and the caller mails staff only when this returns a
 * row: one notice per lapsed subscription per day, however often Paystack
 * retries the charge.
 */
export async function recordFailedRenewal(payload: PaystackTransaction) {
  const failure = renewalFailureOf(payload)
  if (!failure) return null

  // The first charge of a new monthly gift already has a row of ours. A failure
  // there is the donor retrying on the page, not a lapsed renewal.
  if (await getDonationByReference(failure.reference)) return null

  const db = useDatabase()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const [recent] = await db
    .select({ id: donations.id })
    .from(donations)
    .where(
      and(
        eq(donations.subscriptionCode, failure.subscriptionCode),
        eq(donations.status, 'failed'),
        gt(donations.createdAt, since),
      ),
    )
    .limit(1)

  if (recent) return null

  const [row] = await db
    .insert(donations)
    .values({
      reference: failure.reference,
      status: 'failed',
      amountPesewas: failure.amountPesewas,
      currency: payload.currency ?? 'GHS',
      frequency: 'monthly',
      donorName: failure.donorName,
      donorEmail: failure.donorEmail,
      channel: payload.channel ?? null,
      planCode:
        typeof payload.plan === 'object' && payload.plan ? (payload.plan.plan_code ?? null) : null,
      customerCode: payload.customer?.customer_code ?? null,
      subscriptionCode: failure.subscriptionCode,
      payload: payload as unknown as Record<string, unknown>,
    })
    .onConflictDoNothing({ target: donations.reference })
    .returning()

  return row ?? null
}

/** One Paystack plan per monthly amount; created on first use and shared after. */
export async function planCodeFor(amountPesewas: number) {
  const db = useDatabase()
  const [existing] = await db
    .select()
    .from(donationPlans)
    .where(eq(donationPlans.amountPesewas, amountPesewas))
    .limit(1)

  if (existing) return existing.code

  const plan = await createMonthlyPlan(amountPesewas)
  const [row] = await db
    .insert(donationPlans)
    .values({ amountPesewas, code: plan.plan_code })
    .onConflictDoNothing({ target: donationPlans.amountPesewas })
    .returning()

  if (row) return row.code

  const [created] = await db
    .select()
    .from(donationPlans)
    .where(eq(donationPlans.amountPesewas, amountPesewas))
    .limit(1)

  return created?.code ?? plan.plan_code
}

export async function listDonations(
  options: { status?: DonationStatus; search?: string } = {},
): Promise<DonationSummary[]> {
  const db = useDatabase()
  const clauses = []

  if (options.status) clauses.push(eq(donations.status, options.status))

  const needle = options.search?.trim()
  if (needle) {
    const like = `%${needle}%`
    clauses.push(
      or(
        ilike(donations.donorName, like),
        ilike(donations.donorEmail, like),
        ilike(donations.reference, like),
      ),
    )
  }

  const rows = await db
    .select()
    .from(donations)
    .where(clauses.length ? and(...clauses) : undefined)
    .orderBy(desc(donations.createdAt))
    .limit(500)

  return rows.map(toDonationSummary)
}

export async function donationTotals(): Promise<DonationTotals> {
  const db = useDatabase()
  const [settled] = await db
    .select({ total: sum(donations.amountPesewas), totalCount: count() })
    .from(donations)
    .where(eq(donations.status, 'succeeded'))
  const [pending] = await db
    .select({ totalCount: count() })
    .from(donations)
    .where(eq(donations.status, 'pending'))

  return {
    succeededPesewas: Number(settled?.total ?? 0),
    succeededCount: Number(settled?.totalCount ?? 0),
    pendingCount: Number(pending?.totalCount ?? 0),
  }
}
