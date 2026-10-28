import { defineConfig } from 'drizzle-kit'

/** `drizzle-kit generate` needs no database; `migrate` reads DATABASE_URL. */
export default defineConfig({
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/postgres',
  },
  strict: true,
  verbose: true,
})
