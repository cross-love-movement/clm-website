import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

/**
 * Event registrations live in their own SQLite file, separate from the
 * build-time content database. Node 24 ships `node:sqlite`, so there is no
 * native dependency to compile.
 *
 * Set `NUXT_EVENTS_DB_PATH` to a path on a persistent volume in production
 * (for example `/app/data/events.sqlite`). Without a volume, a redeploy
 * replaces the container and the registrations go with it.
 */
let database: DatabaseSync | undefined

export function eventsDatabasePath() {
  return process.env.NUXT_EVENTS_DB_PATH || resolve(process.cwd(), '.data/events.sqlite')
}

export function useEventsDb() {
  if (database) return database

  const path = eventsDatabasePath()
  mkdirSync(dirname(path), { recursive: true })

  const db = new DatabaseSync(path)
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA busy_timeout = 5000')

  db.exec(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_slug  TEXT    NOT NULL,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT    NOT NULL DEFAULT '',
      attendees   INTEGER NOT NULL CHECK (attendees > 0),
      notes       TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'confirmed'
                          CHECK (status IN ('confirmed', 'cancelled')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `)
  db.exec(`
    CREATE INDEX IF NOT EXISTS event_registrations_slug_status
      ON event_registrations (event_slug, status)
  `)

  database = db
  return db
}

/** Test helper: drop the cached handle so a new path can be opened. */
export function closeEventsDb() {
  database?.close()
  database = undefined
}
