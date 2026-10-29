import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const subscriberStatus = pgEnum('subscriber_status', ['subscribed', 'unsubscribed'])

/**
 * The monthly-note list. One row per address, so a repeat signup cannot
 * duplicate a subscriber or send a second welcome email.
 */
export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    status: subscriberStatus('status').notNull().default('subscribed'),
    /**
     * Opaque token used in the unsubscribe link. Random rather than derived
     * from the address, so a link cannot be guessed by hashing an email.
     */
    token: text('token').notNull().unique(),
    /** Where the address came from: `website`, `import`, or staff. */
    source: text('source').notNull().default('website'),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull().defaultNow(),
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('newsletter_subscribers_status_idx').on(table.status, table.subscribedAt)],
)

export type SubscriberRow = typeof newsletterSubscribers.$inferSelect
export type NewSubscriber = typeof newsletterSubscribers.$inferInsert
export type SubscriberState = SubscriberRow['status']
