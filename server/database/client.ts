import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'

/**
 * One pool per process. Nitro is single-process, so this is the whole story.
 *
 * Coolify's internal Postgres does not need TLS; set `DATABASE_SSL=true` only
 * when the database is reached over a public network or a managed provider
 * that requires it.
 */
let pool: Pool | undefined
let database: NodePgDatabase<typeof schema> | undefined

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

export function useDatabase(): NodePgDatabase<typeof schema> {
  if (database) return database

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set — the database is not configured.')
  }

  pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  })

  database = drizzle(pool, { schema })

  return database
}

export async function closeDatabase() {
  await pool?.end()
  pool = undefined
  database = undefined
}
