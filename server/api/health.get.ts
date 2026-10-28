import { sql } from 'drizzle-orm'

import { hasDatabase, useDatabase } from '../database/client'

/** Coolify health check: reports whether the database answers. */
export default defineEventHandler(async () => {
  if (!hasDatabase()) {
    return { ok: true, database: 'not-configured' }
  }

  try {
    await useDatabase().execute(sql`select 1`)
    return { ok: true, database: 'up' }
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Database unavailable' })
  }
})
