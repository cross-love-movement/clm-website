import { asc, eq } from 'drizzle-orm'

import { isDatabaseReady, useDatabase } from '../../database/client'
import { mailOutbox } from '../../database/schema'

/**
 * Sends pending outbox rows. Called on boot and on a timer.
 *
 * A row only becomes `sent` after delivery is attempted, so a retry after a
 * failure cannot send twice. Five failed attempts mark it `failed` and leave
 * it for a human to inspect.
 */
export async function drainOutbox(limit = 10) {
  // Plugins may start in any order; never touch the table before migrations.
  if (!isDatabaseReady()) return 0

  const db = useDatabase()
  const pending = await db
    .select()
    .from(mailOutbox)
    .where(eq(mailOutbox.status, 'pending'))
    .orderBy(asc(mailOutbox.createdAt))
    .limit(limit)

  for (const row of pending) {
    try {
      await sendMail({
        to: row.toEmail,
        replyTo: row.replyTo ?? undefined,
        subject: row.subject,
        text: row.body,
        html: row.html ?? undefined,
        tag: row.kind,
        variables: row.variables ?? undefined,
      })

      await db
        .update(mailOutbox)
        .set({ status: 'sent', sentAt: new Date(), lastError: null })
        .where(eq(mailOutbox.id, row.id))
    } catch (error) {
      const attempts = row.attempts + 1
      const message = error instanceof Error ? error.message : String(error)

      await db
        .update(mailOutbox)
        .set({
          attempts,
          lastError: message.slice(0, 500),
          status: attempts >= 5 ? 'failed' : 'pending',
        })
        .where(eq(mailOutbox.id, row.id))
    }
  }

  return pending.length
}
