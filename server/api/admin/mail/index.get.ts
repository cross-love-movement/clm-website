import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm'

import { MAIL_PERMISSIONS } from '#shared/types/auth'
import {
  MAIL_STATUSES,
  type MailMessage,
  type MailStatus,
  type MailSummary,
} from '#shared/types/mail'

import { useDatabase } from '../../../database/client'
import { mailOutbox, type MailOutboxRow } from '../../../database/schema'
import { requireAnyPermission } from '../../../features/auth/guards'

function toMessage(row: MailOutboxRow): MailMessage {
  return {
    id: row.id,
    kind: row.kind,
    toEmail: row.toEmail,
    subject: row.subject,
    status: row.status as MailStatus,
    attempts: row.attempts,
    lastError: row.lastError,
    createdAt: row.createdAt.toISOString(),
    sentAt: row.sentAt ? row.sentAt.toISOString() : null,
  }
}

/**
 * GET /api/admin/mail
 *
 * Recent outbox rows, newest first, with counts for each status. Any staff
 * member with an operational permission can see this; it contains recipient
 * addresses, so it is not public.
 */
export default defineEventHandler(async (event) => {
  await requireAnyPermission(event, MAIL_PERMISSIONS)

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' && MAIL_STATUSES.includes(query.status as MailStatus)
      ? (query.status as MailStatus)
      : undefined
  const search = typeof query.search === 'string' ? query.search.trim() : ''

  const conditions: SQL[] = []

  if (status) conditions.push(eq(mailOutbox.status, status))

  if (search) {
    const needle = `%${search}%`
    const match = or(
      ilike(mailOutbox.toEmail, needle),
      ilike(mailOutbox.subject, needle),
      ilike(mailOutbox.kind, needle),
    )

    if (match) conditions.push(match)
  }

  const db = useDatabase()
  const rows = await db
    .select()
    .from(mailOutbox)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(mailOutbox.createdAt))
    .limit(100)

  const grouped = await db
    .select({ status: mailOutbox.status, total: count() })
    .from(mailOutbox)
    .groupBy(mailOutbox.status)

  const summary: MailSummary = { pending: 0, sent: 0, failed: 0 }

  for (const group of grouped) {
    if (group.status in summary) {
      summary[group.status as keyof MailSummary] = Number(group.total)
    }
  }

  return { rows: rows.map(toMessage), summary }
})
