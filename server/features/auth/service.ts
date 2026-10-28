import { and, eq } from 'drizzle-orm'

import type { Permission, SessionUser, UserRole } from '#shared/types/auth'
import { defaultPermissions } from '#shared/types/auth'

import { useDatabase } from '../../database/client'
import { users, volunteers, type User } from '../../database/schema'
import { hashPassword, verifyPassword } from './password'
import { consumeToken, issueToken } from './tokens'

export function toSessionUser(user: User): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions as Permission[],
  }
}

export async function findUserByEmail(email: string) {
  const database = useDatabase()
  const rows = await database
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1)

  return rows[0] ?? null
}

export interface InviteResult {
  user: User
  token: string
}

/**
 * Creates an invited account, or re-invites one that was never activated.
 * An active account is left untouched — an invite must never change a role or
 * reset a password for someone who already has access.
 */
export async function inviteUser(input: {
  email: string
  name: string
  role: UserRole
  permissions?: Permission[]
}): Promise<InviteResult | null> {
  const database = useDatabase()
  const email = input.email.trim().toLowerCase()
  const existing = await findUserByEmail(email)
  const permissions =
    input.role === 'admin' ? (input.permissions ?? defaultPermissions('admin')) : []

  if (existing) {
    if (existing.status === 'active') return null

    const [updated] = await database
      .update(users)
      .set({
        name: input.name,
        role: input.role,
        permissions,
        status: 'invited',
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning()

    const token = await issueToken(existing.id, 'invite', 60 * 24 * 7)
    return { user: updated ?? existing, token }
  }

  const [created] = await database
    .insert(users)
    .values({ email, name: input.name, role: input.role, permissions, status: 'invited' })
    .returning()

  if (!created) return null

  const token = await issueToken(created.id, 'invite', 60 * 24 * 7)

  return { user: created, token }
}

/** Returns null for unknown or suspended accounts, so callers stay generic. */
export async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email)

  if (!user || user.status === 'suspended') return null

  // An invited account has no password yet: send an invite-length link.
  const kind = user.passwordHash ? 'password_reset' : 'invite'
  const ttl = user.passwordHash ? 60 : 60 * 24 * 7

  return { user, token: await issueToken(user.id, kind, ttl) }
}

/**
 * Accepts either an invite or a reset token, sets the password, and activates
 * the account. Returns null when the token is invalid, used, or expired.
 */
export async function completePasswordSetup(rawToken: string, password: string) {
  const token = rawToken.trim()

  const userId =
    (await consumeToken(token, 'password_reset')) ?? (await consumeToken(token, 'invite'))

  if (!userId) return null

  const database = useDatabase()

  // A suspended account must not activate itself by replaying an invite token
  // that was issued before the suspension.
  const [account] = await database
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!account || account.status === 'suspended') return null

  const now = new Date()
  const passwordHash = await hashPassword(password)

  const [updated] = await database
    .update(users)
    .set({ passwordHash, status: 'active', emailVerifiedAt: now, updatedAt: now })
    .where(eq(users.id, userId))
    .returning()

  if (updated) {
    // A volunteer who accepts an invite becomes active in the volunteer app too.
    await database
      .update(volunteers)
      .set({ status: 'active', updatedAt: now })
      .where(and(eq(volunteers.userId, userId), eq(volunteers.status, 'invited')))
  }

  return updated ?? null
}

export async function authenticate(email: string, password: string) {
  const user = await findUserByEmail(email)

  if (!user || user.status !== 'active') return null
  if (!(await verifyPassword(password, user.passwordHash))) return null

  const database = useDatabase()
  const now = new Date()

  await database
    .update(users)
    .set({ lastLoginAt: now, updatedAt: now })
    .where(eq(users.id, user.id))

  return user
}
