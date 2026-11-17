import { and, count, desc, eq, ilike, or } from 'drizzle-orm'

import type { AuditEntry } from '#shared/types/audit'
import type { SessionUser } from '#shared/types/auth'

import { useDatabase } from '../../database/client'
import { auditLog, type AuditRow } from '../../database/schema'

function toEntry(row: AuditRow): AuditEntry {
  return {
    id: row.id,
    actorId: row.actorId,
    actorName: row.actorName,
    actorEmail: row.actorEmail,
    action: row.action,
    entity: row.entity,
    entityId: row.entityId,
    summary: row.summary,
    metadata: row.metadata ?? null,
    createdAt: row.createdAt.toISOString(),
  }
}

export interface RecordAuditInput {
  action: string
  entity: string
  entityId?: string | null
  summary: string
  metadata?: Record<string, unknown>
}

/**
 * Writes one line to the trail. Call this after the change has committed: a
 * failed audit write must never roll back the work itself, and every caller
 * already holds the session user that `requirePermission` returned.
 */
export async function recordAudit(actor: SessionUser, input: RecordAuditInput) {
  try {
    const db = useDatabase()

    await db.insert(auditLog).values({
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      summary: input.summary,
      metadata: input.metadata ?? null,
    })
  } catch (error) {
    // The action already happened. Losing the trail entry is bad, but failing
    // the request would tell staff their work did not go through — and invite
    // them to retry a cancellation that has already taken effect.
    console.error('[audit] could not record', input.action, input.entityId, error)
  }
}

export interface AuditFilter {
  entity?: string
  search?: string
}

function auditFilter(options: AuditFilter) {
  const clauses = []

  if (options.entity) clauses.push(eq(auditLog.entity, options.entity))

  const needle = options.search?.trim()
  if (needle) {
    const like = `%${needle}%`
    clauses.push(
      or(
        ilike(auditLog.summary, like),
        ilike(auditLog.actorName, like),
        ilike(auditLog.actorEmail, like),
        ilike(auditLog.action, like),
      ),
    )
  }

  return clauses.length ? and(...clauses) : undefined
}

export async function listAudit(
  options: AuditFilter & { limit?: number; offset?: number } = {},
): Promise<AuditEntry[]> {
  const db = useDatabase()
  const statement = db
    .select()
    .from(auditLog)
    .where(auditFilter(options))
    .orderBy(desc(auditLog.createdAt), desc(auditLog.id))
    .$dynamic()

  if (options.limit !== undefined) statement.limit(options.limit)
  if (options.offset) statement.offset(options.offset)

  const rows = await statement

  return rows.map(toEntry)
}

export async function countAudit(options: AuditFilter = {}) {
  const db = useDatabase()
  const [row] = await db.select({ total: count() }).from(auditLog).where(auditFilter(options))

  return Number(row?.total ?? 0)
}
