import { sql } from 'drizzle-orm'

import { hasDatabase, useDatabase } from '../database/client'

/**
 * Coolify health check: reports whether the database answers and whether mail
 * delivery is configured. The mail flag is safe to expose — it says only
 * whether a key is present, never the key itself.
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const mail = config.resendApiKey ? 'configured' : 'not-configured'

  if (!hasDatabase()) {
    return { ok: true, database: 'not-configured', mail }
  }

  try {
    await useDatabase().execute(sql`select 1`)
    return { ok: true, database: 'up', mail }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Database unavailable' })
  }
})
