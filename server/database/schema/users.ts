import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { USER_ROLES } from '../../../shared/types/auth'

/**
 * Roles map to portals:
 *   superadmin — staff portal, plus user management
 *   admin      — staff portal, all records
 *   editor     — staff portal, content and event records
 *   viewer     — staff portal, read-only
 *   member     — member portal (own registrations, profile)
 */
export const userRole = pgEnum('user_role', USER_ROLES)

export const userStatus = pgEnum('user_status', ['invited', 'active', 'suspended'])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Stored lower-cased. Unique, so one account per address. */
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: userRole('role').notNull().default('member'),
  status: userStatus('status').notNull().default('active'),
  /** scrypt hash. Null until the account holder sets a password. */
  passwordHash: text('password_hash'),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const authTokenKind = pgEnum('auth_token_kind', [
  'password_reset',
  'email_verification',
  'invite',
])

/**
 * Single-use tokens, stored hashed. The raw value only ever exists in the
 * email we send, so a database leak cannot be used to take over an account.
 */
export const authTokens = pgTable(
  'auth_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: authTokenKind('kind').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('auth_tokens_hash_idx').on(table.tokenHash),
    index('auth_tokens_user_idx').on(table.userId),
  ],
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserRole = User['role']
export type AuthToken = typeof authTokens.$inferSelect
