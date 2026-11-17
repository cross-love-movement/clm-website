import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { migrate } from 'drizzle-orm/node-postgres/migrator'

import { useDatabase } from './client'

/**
 * Migrations are generated into `server/database/migrations` and committed.
 * The Docker runtime image copies that folder to `/app/migrations`, which is
 * why the path is configurable.
 *
 * An empty `MIGRATIONS_DIR` in Coolify would otherwise override the image's
 * `/app/migrations` and point at the source tree, which is not shipped in the
 * runtime image. Fall back to the image path when the source tree is absent.
 */
export function migrationsDirectory() {
  const configured = process.env.MIGRATIONS_DIR?.trim()

  if (configured) return configured

  const local = resolve(process.cwd(), 'server/database/migrations')
  if (existsSync(local)) return local

  const image = '/app/migrations'
  if (existsSync(image)) return image

  return local
}

export async function runMigrations() {
  await migrate(useDatabase(), { migrationsFolder: migrationsDirectory() })
}
