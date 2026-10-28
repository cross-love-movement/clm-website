import { resolve } from 'node:path'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { useDatabase } from './client'

/**
 * Migrations are generated into `server/database/migrations` and committed.
 * The Docker runtime image copies that folder to `/app/migrations`, which is
 * why the path is configurable.
 */
export function migrationsDirectory() {
  return process.env.MIGRATIONS_DIR || resolve(process.cwd(), 'server/database/migrations')
}

export async function runMigrations() {
  await migrate(useDatabase(), { migrationsFolder: migrationsDirectory() })
}
