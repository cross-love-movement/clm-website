import { index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

/**
 * Who did something that mattered, when.
 *
 * The actor's name and address are copied in: the person may be suspended or
 * deleted later, and the trail has to keep reading correctly without a join.
 * Nothing here is a substitute for the operational record — it is the sentence
 * that explains it ("Ama refunded CLM-DON-XXXX").
 */
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorName: text('actor_name').notNull().default(''),
    actorEmail: text('actor_email').notNull().default(''),
    /** Dotted verb, e.g. `donation.refunded`, `event.cancelled`. */
    action: text('action').notNull(),
    /** What kind of record it happened to: `donation`, `event`, `user`. */
    entity: text('entity').notNull(),
    /** Id or slug of that record, as text so any table can be referenced. */
    entityId: text('entity_id'),
    /** One human sentence, already safe to show to staff. */
    summary: text('summary').notNull().default(''),
    /** Small, non-sensitive extras: old and new values, amounts, counts. */
    metadata: jsonb('metadata').$type<Record<string, unknown> | null>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('audit_log_created_idx').on(table.createdAt),
    index('audit_log_entity_idx').on(table.entity, table.entityId),
    index('audit_log_actor_idx').on(table.actorId),
  ],
)

export type AuditRow = typeof auditLog.$inferSelect
