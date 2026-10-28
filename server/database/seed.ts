import { eq } from 'drizzle-orm'

import { useDatabase } from './client'
import { users, type User } from './schema'

/**
 * Seeds the first superadmin from the environment. Idempotent: running it on
 * every boot is safe, and it never overwrites an existing account.
 *
 *   SEED_SUPERADMIN_EMAIL=isaac@example.com
 *   SEED_SUPERADMIN_NAME="Isaac Nkrumah Dadzie"
 *
 * Leave the email unset to skip seeding.
 */
export async function seedSuperadmin(): Promise<User | null> {
  const email = process.env.SEED_SUPERADMIN_EMAIL?.trim().toLowerCase()
  if (!email) return null

  const name = process.env.SEED_SUPERADMIN_NAME?.trim() || 'Super Admin'
  const database = useDatabase()

  const existing = await database.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing[0]) return existing[0]

  const created = await database
    .insert(users)
    .values({ email, name, role: 'superadmin', status: 'active' })
    .returning()

  return created[0] ?? null
}
