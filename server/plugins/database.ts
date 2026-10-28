import { closeDatabase, hasDatabase } from '../database/client'
import { runMigrations } from '../database/migrate'
import { seedSuperadmin } from '../database/seed'

/**
 * Applies pending migrations and seeds the first superadmin at boot.
 *
 * Safe for a single replica, which is what this deployment is. If the app ever
 * runs more than one, move migrations to a one-off deploy step and wrap this in
 * a Postgres advisory lock.
 */
export default defineNitroPlugin(async (nitroApp) => {
  if (!hasDatabase()) {
    console.warn('[db] DATABASE_URL is not set — database features are disabled.')
    return
  }

  try {
    if (process.env.DB_MIGRATE_ON_START !== 'false') {
      await runMigrations()
    }

    const admin = await seedSuperadmin()
    if (admin) {
      console.info(`[db] superadmin ready: ${admin.email} (${admin.role})`)
    }
  } catch (error) {
    // Keep the marketing site up even if the database is unreachable, but make
    // the failure obvious in the deploy logs and at /api/health.
    console.error('[db] startup failed:', error)
  }

  nitroApp.hooks.hook('close', async () => {
    await closeDatabase()
  })
})
