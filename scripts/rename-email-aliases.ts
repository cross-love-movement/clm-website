/**
 * Renames Resend template aliases in place.
 *
 *   npm run emails:rename -- --dry-run event-registration=clm-event-registration
 *   npm run emails:rename -- event-registration=clm-event-registration
 *   npm run emails:rename -- --write-env event-registration=clm-event-registration
 *
 * The **old** alias is read from the kind's `RESEND_TEMPLATE_*` variable, so run
 * this before changing the environment. Resend renames by patching the template
 * and keeping its id; the alias itself is not editable in the HTML file.
 *
 * `--write-env` rewrites the matching lines in `.env` (default) once every
 * rename succeeds, which keeps the app pointing at aliases that exist. It only
 * touches `RESEND_TEMPLATE_*` lines and never prints secret values.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { EMAIL_TEMPLATES } from '../server/emails/catalog.ts'

const API = 'https://api.resend.com'
const ALIAS = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const writeEnv = args.includes('--write-env')

const envFlag = args.find((arg) => arg.startsWith('--env='))
const envPath = resolve(process.cwd(), envFlag ? envFlag.slice('--env='.length) : '.env')

const pairs = args
  .filter((arg) => !arg.startsWith('--'))
  .map((arg) => {
    const [kind, next] = arg.split('=')

    return { raw: arg, kind: kind ?? '', next: (next ?? '').trim() }
  })

if (!pairs.length) {
  console.error(
    'Nothing to rename. Pass one or more kind=new-alias pairs, e.g.\n' +
      '  npm run emails:rename -- event-registration=clm-event-registration',
  )
  process.exit(1)
}

for (const pair of pairs) {
  if (!EMAIL_TEMPLATES[pair.kind]) {
    console.error(
      `Unknown kind "${pair.kind}". Known kinds: ${Object.keys(EMAIL_TEMPLATES).join(', ')}`,
    )
    process.exit(1)
  }

  if (!ALIAS.test(pair.next)) {
    console.error(
      `Invalid alias "${pair.next}" for ${pair.kind} — use lower-case words and hyphens.`,
    )
    process.exit(1)
  }
}

const key = (process.env.RESEND_API_KEY || process.env.NUXT_RESEND_API_KEY || '').trim()

if (!dryRun && !key) {
  console.error('Set RESEND_API_KEY (or NUXT_RESEND_API_KEY) before renaming, e.g. in .env.')
  process.exit(1)
}

interface Rename {
  kind: string
  env: string
  from: string
  to: string
}

async function describeError(response: Response) {
  const text = await response.text()

  try {
    const data = JSON.parse(text) as { message?: string }
    return data.message ? String(data.message) : text
  } catch {
    return text
  }
}

let failed = 0
const applied: Rename[] = []

for (const pair of pairs) {
  const env = EMAIL_TEMPLATES[pair.kind]!.env
  const from = process.env[env]?.trim()

  if (!from) {
    console.error(`${pair.kind.padEnd(24)} skipped — ${env} is empty`)
    continue
  }

  if (from === pair.next) {
    console.log(`${pair.kind.padEnd(24)} already ${pair.next}`)
    continue
  }

  if (dryRun) {
    console.log(`${pair.kind.padEnd(24)} would rename ${from} → ${pair.next}`)
    applied.push({ kind: pair.kind, env, from, to: pair.next })
    continue
  }

  const response = await fetch(`${API}/templates/${encodeURIComponent(from)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alias: pair.next }),
  })

  if (!response.ok) {
    failed += 1
    console.error(
      `${pair.kind.padEnd(24)} FAILED (${response.status}): ${await describeError(response)}`,
    )
    continue
  }

  console.log(`${pair.kind.padEnd(24)} renamed ${from} → ${pair.next}`)
  applied.push({ kind: pair.kind, env, from, to: pair.next })
}

if (failed > 0) {
  console.error(`\n${failed} rename(s) failed. .env was not touched.`)
  process.exit(1)
}

if (!writeEnv || !applied.length) {
  if (applied.length && !writeEnv) {
    console.log('\nUpdate these in .env and in the deployment environment, then run emails:sync:')
    for (const rename of applied) console.log(`  ${rename.env}=${rename.to}`)
  }

  process.exit(0)
}

if (dryRun) {
  console.log(`\n--dry-run: ${envPath} would be updated for ${applied.length} key(s).`)
  process.exit(0)
}

const original = await readFile(envPath, 'utf8')
let next = original
const missing: Rename[] = []

for (const rename of applied) {
  const line = new RegExp(`^${rename.env}=.*$`, 'm')

  if (line.test(next)) {
    next = next.replace(line, `${rename.env}=${rename.to}`)
  } else {
    missing.push(rename)
  }
}

if (missing.length) {
  next = `${next.replace(/\s*$/, '')}\n${missing
    .map((rename) => `${rename.env}=${rename.to}`)
    .join('\n')}\n`
}

if (next !== original) {
  await writeFile(envPath, next, 'utf8')
}

console.log(
  `\n${envPath} updated: ${applied.length - missing.length} replaced, ${missing.length} appended.`,
)
console.log('Set the same values in the deployment environment, then run emails:sync.')
