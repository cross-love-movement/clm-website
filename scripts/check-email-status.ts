/**
 * Read-only check of the Resend side.
 *
 *   npm run emails:status
 *
 * For every kind: is its `RESEND_TEMPLATE_*` alias set, does it resolve to a
 * template, is that template published, and is the record actually carrying
 * the alias we asked for? Resend keeps resolving an old alias after a rename,
 * so the last check catches an environment that was never updated.
 *
 * Exits non-zero when anything would stop a send, which makes it usable in CI.
 */

import { EMAIL_TEMPLATES } from '../server/emails/catalog.ts'

const API = 'https://api.resend.com'
const key = (process.env.RESEND_API_KEY || process.env.NUXT_RESEND_API_KEY || '').trim()

if (!key) {
  console.error('Set RESEND_API_KEY (or NUXT_RESEND_API_KEY) before checking, e.g. in .env.')
  process.exit(1)
}

interface TemplateRecord {
  alias?: string
  name?: string
  status?: string
  published_at?: string | null
}

let issues = 0
let checked = 0

for (const [kind, template] of Object.entries(EMAIL_TEMPLATES)) {
  const alias = process.env[template.env]?.trim()

  if (!alias) {
    console.log(`${kind.padEnd(24)} — ${template.env} is empty; the local file is used`)
    continue
  }

  checked += 1

  const response = await fetch(`${API}/templates/${encodeURIComponent(alias)}`, {
    headers: { Authorization: `Bearer ${key}` },
  })

  if (!response.ok) {
    issues += 1
    console.log(`${kind.padEnd(24)} ✗ ${alias} — not found (${response.status})`)
    continue
  }

  const record = (await response.json()) as TemplateRecord
  const published = record.status === 'published'
  const rightAlias = record.alias === alias

  if (!published || !rightAlias) {
    issues += 1
    console.log(
      `${kind.padEnd(24)} ✗ ${alias} — status ${record.status ?? 'unknown'}` +
        (rightAlias ? '' : `, resolves to "${record.alias}" — update ${template.env}`),
    )
    continue
  }

  console.log(
    `${kind.padEnd(24)} ✓ ${alias} — published ${record.published_at ?? '(no timestamp)'}`,
  )
}

console.log(
  issues
    ? `\n${issues} of ${checked} configured alias(es) need attention.`
    : `\nAll ${checked} configured alias(es) resolve to published templates.`,
)

process.exitCode = issues ? 1 : 0
