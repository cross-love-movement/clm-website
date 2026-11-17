import { sql } from 'drizzle-orm'

import { hasDatabase, isDatabaseReady, useDatabase } from '../database/client'
import { paystackConfigured } from '../features/donations/paystack'

/**
 * Coolify health check: reports whether the database answers, whether mail
 * delivery is configured, and whether the outbox worker is allowed to run.
 *
 * `outbox: not-ready` means migrations did not complete, so queued mail will
 * never be sent. The flags are safe to expose — no keys or addresses.
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const mail = config.resendApiKey ? 'configured' : 'not-configured'
  const outbox = !hasDatabase() ? 'not-configured' : isDatabaseReady() ? 'ready' : 'not-ready'
  const payments = paystackConfigured() ? 'configured' : 'not-configured'

  if (!hasDatabase()) {
    return { ok: true, database: 'not-configured', mail, outbox, payments }
  }

  try {
    await useDatabase().execute(sql`select 1`)
    return { ok: true, database: 'up', mail, outbox, payments }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Database unavailable' })
  }
})
