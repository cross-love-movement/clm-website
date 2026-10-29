import { randomBytes } from 'node:crypto'

import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm'

import type {
  NewsletterSubscriber,
  NewsletterSummary,
  SubscriberStatus,
} from '#shared/types/content'

import { useDatabase } from '../../database/client'
import { mailOutbox, newsletterSubscribers, type SubscriberRow } from '../../database/schema'
import { issueMail, welcomeMail } from './mail'

/**
 * 18 random bytes as base64url — 24 URL-safe characters. Opaque so an
 * unsubscribe link cannot be derived from a known email address.
 */
function newToken() {
  return randomBytes(18).toString('base64url')
}

function toSubscriber(row: SubscriberRow): NewsletterSubscriber {
  return {
    id: row.id,
    email: row.email,
    status: row.status,
    source: row.source,
    subscribedAt: row.subscribedAt.toISOString(),
    unsubscribedAt: row.unsubscribedAt ? row.unsubscribedAt.toISOString() : null,
  }
}

export interface SubscribeResult {
  outcome: 'new' | 'resubscribed' | 'already'
}

/**
 * Adds an address to the list and queues the welcome mail.
 *
 * A repeat signup for an address that is already subscribed is a no-op — no
 * second row, no second email. Someone who unsubscribed in the past is put
 * back on the list and receives the welcome again, because they asked.
 */
export async function subscribeToNewsletter(
  email: string,
  source = 'website',
): Promise<SubscribeResult> {
  const db = useDatabase()
  const normalized = email.trim().toLowerCase()

  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(newsletterSubscribers)
      .values({ email: normalized, token: newToken(), source })
      .onConflictDoNothing({ target: newsletterSubscribers.email })
      .returning()

    let row = inserted

    if (!row) {
      const [existing] = await tx
        .select()
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, normalized))
        .for('update')

      if (!existing) throw new Error('Subscriber disappeared during signup')
      if (existing.status === 'subscribed') return { outcome: 'already' } as const

      const [restored] = await tx
        .update(newsletterSubscribers)
        .set({ status: 'subscribed', unsubscribedAt: null, updatedAt: new Date() })
        .where(eq(newsletterSubscribers.id, existing.id))
        .returning()

      row = restored
      if (!row) throw new Error('Could not restore the subscription')

      await tx.insert(mailOutbox).values(welcomeMail(row))

      return { outcome: 'resubscribed' } as const
    }

    await tx.insert(mailOutbox).values(welcomeMail(row))

    return { outcome: 'new' } as const
  })
}

/** Public unsubscribe. Idempotent: an already-unsubscribed token is a success. */
export async function unsubscribeByToken(token: string) {
  const db = useDatabase()
  const [existing] = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.token, token.trim()))
    .limit(1)

  if (!existing) return false
  if (existing.status === 'unsubscribed') return true

  await db
    .update(newsletterSubscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: new Date(), updatedAt: new Date() })
    .where(eq(newsletterSubscribers.id, existing.id))

  return true
}

/** Staff-side removal. Keeps the row so the history stays visible. */
export async function unsubscribeSubscriber(id: string) {
  const db = useDatabase()
  const [row] = await db
    .update(newsletterSubscribers)
    .set({ status: 'unsubscribed', unsubscribedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(newsletterSubscribers.id, id), eq(newsletterSubscribers.status, 'subscribed')))
    .returning()

  return Boolean(row)
}

export interface SubscriberFilter {
  status?: SubscriberStatus
  search?: string
}

export async function listSubscribers(filter: SubscriberFilter = {}) {
  const db = useDatabase()
  const search = filter.search?.trim()

  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .where(
      and(
        filter.status ? eq(newsletterSubscribers.status, filter.status) : undefined,
        search ? ilike(newsletterSubscribers.email, `%${search}%`) : undefined,
      ),
    )
    .orderBy(desc(newsletterSubscribers.subscribedAt))

  return rows.map(toSubscriber)
}

export async function summariseSubscribers(): Promise<NewsletterSummary> {
  const db = useDatabase()
  const rows = await db
    .select({
      status: newsletterSubscribers.status,
      total: sql<number>`count(*)::int`,
    })
    .from(newsletterSubscribers)
    .groupBy(newsletterSubscribers.status)

  const subscribed = Number(rows.find((row) => row.status === 'subscribed')?.total ?? 0)
  const unsubscribed = Number(rows.find((row) => row.status === 'unsubscribed')?.total ?? 0)

  return { subscribed, unsubscribed, total: subscribed + unsubscribed }
}

export interface IssueInput {
  subject: string
  body: string
}

/**
 * Queues one issue per subscribed address. The unsubscribe link is unique per
 * row, so it is built here rather than in the template.
 */
export async function sendNewsletterIssue(input: IssueInput) {
  const db = useDatabase()

  return db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, 'subscribed'))
      .orderBy(asc(newsletterSubscribers.subscribedAt))

    if (!rows.length) return { recipients: 0 }

    await tx.insert(mailOutbox).values(rows.map((row) => issueMail(row, input)))

    return { recipients: rows.length }
  })
}
