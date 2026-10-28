import { createHash, randomBytes } from 'node:crypto'

import { and, eq, gt, isNull } from 'drizzle-orm'

import { useDatabase } from '../../database/client'
import { authTokens, type AuthToken } from '../../database/schema'

export type TokenKind = AuthToken['kind']

/** 32 random bytes, URL-safe. This is the only copy of the raw value. */
export function createRawToken() {
  return randomBytes(32).toString('base64url')
}

export function hashToken(raw: string) {
  return createHash('sha256').update(raw).digest('hex')
}

/**
 * Issues a token and invalidates any earlier unused tokens of the same kind,
 * so an old email stops working the moment a new one is sent.
 */
export async function issueToken(userId: string, kind: TokenKind, ttlMinutes: number) {
  const db = useDatabase()
  const raw = createRawToken()

  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.kind, kind)))

  await db.insert(authTokens).values({
    userId,
    kind,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
  })

  return raw
}

/** Marks the token used and returns its owner, or null if invalid/expired/used. */
export async function consumeToken(raw: string, kind: TokenKind) {
  const db = useDatabase()

  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, hashToken(raw)),
        eq(authTokens.kind, kind),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: authTokens.userId })

  return row?.userId ?? null
}
