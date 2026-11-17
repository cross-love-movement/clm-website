import { eq } from 'drizzle-orm'

import { MAIL_PERMISSIONS } from '#shared/types/auth'

import { isDatabaseReady, useDatabase } from '../../../../database/client'
import { mailOutbox } from '../../../../database/schema'
import { requireAnyPermission } from '../../../../features/auth/guards'
import { drainOutbox } from '../../../../features/mail/outbox'

/**
 * POST /api/admin/mail/:id/retry
 *
 * Resets a pending or failed message and asks the worker to drain immediately.
 * Already-sent messages are refused so a retry cannot duplicate a delivery.
 */
export default defineEventHandler(async (event) => {
  await requireAnyPermission(event, MAIL_PERMISSIONS)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing message' })
  }

  if (!isDatabaseReady()) {
    throw createError({ statusCode: 503, statusMessage: 'Database is not ready' })
  }

  const db = useDatabase()
  const [row] = await db.select().from(mailOutbox).where(eq(mailOutbox.id, id)).limit(1)

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  if (row.status === 'sent') {
    throw createError({ statusCode: 409, statusMessage: 'This message was already sent' })
  }

  await db
    .update(mailOutbox)
    .set({ status: 'pending', attempts: 0, lastError: null, sentAt: null })
    .where(eq(mailOutbox.id, id))

  await drainOutbox()

  return { ok: true }
})
