/**
 * Retention cleanup for operational data.
 *
 *   npm run privacy:prune              # dry run, prints counts only
 *   npm run privacy:prune -- --confirm # delete the safe internal sets
 *
 * Only two sets are deleted automatically: auth tokens that are used or expired
 * and older than 30 days, and sent/failed outbox rows older than 90 days.
 *
 * Records about people — event registrations, volunteers, donations, and
 * newsletter subscribers — are only counted and reported. Those need an agreed
 * retention schedule and, for donations, the accounting retention period.
 */

import pg from 'pg'

const connectionString = process.env.DATABASE_URL?.trim()

if (!connectionString) {
  console.error('Set DATABASE_URL before running this script.')
  process.exit(1)
}

const confirm = process.argv.includes('--confirm')

const TOKEN_DAYS = 30
const OUTBOX_DAYS = 90
const REGISTRATION_MONTHS = 24
const VOLUNTEER_MONTHS = 24
const DONATION_YEARS = 7
const UNSUBSCRIBED_DAYS = 30

const client = new pg.Client({ connectionString })
await client.connect()

async function count(sql: string, value: number) {
  const result = await client.query<{ total: number }>(sql, [value])

  return Number(result.rows[0]?.total ?? 0)
}

try {
  const tokens = await count(
    `select count(*)::int as total from auth_tokens
     where (used_at is not null or expires_at < now())
       and created_at < now() - ($1 || ' days')::interval`,
    TOKEN_DAYS,
  )

  const outbox = await count(
    `select count(*)::int as total from mail_outbox
     where status in ('sent', 'failed')
       and created_at < now() - ($1 || ' days')::interval`,
    OUTBOX_DAYS,
  )

  const registrations = await count(
    `select count(*)::int as total
     from event_registrations r
     join events e on e.id = r.event_id
     where e.ends_at < now() - ($1 || ' months')::interval`,
    REGISTRATION_MONTHS,
  )

  const volunteers = await count(
    `select count(*)::int as total from volunteers
     where updated_at < now() - ($1 || ' months')::interval`,
    VOLUNTEER_MONTHS,
  )

  const donations = await count(
    `select count(*)::int as total from donations
     where created_at < now() - ($1 || ' years')::interval`,
    DONATION_YEARS,
  )

  const subscribers = await count(
    `select count(*)::int as total from newsletter_subscribers
     where status = 'unsubscribed'
       and unsubscribed_at < now() - ($1 || ' days')::interval`,
    UNSUBSCRIBED_DAYS,
  )

  console.log('\nRetention report\n')
  console.log(`  Safe to delete:`)
  console.log(`    auth tokens (used/expired, ${TOKEN_DAYS} days)   ${tokens}`)
  console.log(`    outbox rows (sent/failed, ${OUTBOX_DAYS} days)    ${outbox}`)
  console.log(`\n  Review before deleting (not touched by this run):`)
  console.log(`    event registrations older than ${REGISTRATION_MONTHS} months   ${registrations}`)
  console.log(`    volunteers inactive for ${VOLUNTEER_MONTHS} months          ${volunteers}`)
  console.log(`    donations older than ${DONATION_YEARS} years              ${donations}`)
  console.log(`    unsubscribed subscribers older than ${UNSUBSCRIBED_DAYS} days ${subscribers}`)

  if (!confirm) {
    console.log('\nDry run. Re-run with --confirm to delete the two internal sets above.\n')
  } else {
    await client.query('begin')

    const deletedTokens = await client.query(
      `delete from auth_tokens
       where (used_at is not null or expires_at < now())
         and created_at < now() - ($1 || ' days')::interval`,
      [TOKEN_DAYS],
    )

    const deletedOutbox = await client.query(
      `delete from mail_outbox
       where status in ('sent', 'failed')
         and created_at < now() - ($1 || ' days')::interval`,
      [OUTBOX_DAYS],
    )

    await client.query('commit')

    console.log(
      `\nDeleted ${deletedTokens.rowCount ?? 0} auth token(s) and ${deletedOutbox.rowCount ?? 0} outbox row(s).\n`,
    )
  }
} catch (error) {
  console.error('Retention run failed:', error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  await client.end()
}
