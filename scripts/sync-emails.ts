/**
 * Pushes `server/emails/templates/*.html` to Resend and publishes them.
 *
 *   npm run emails:sync            # update or create, then publish
 *   npm run emails:sync -- --dry-run
 *
 * The alias for each kind comes from its `RESEND_TEMPLATE_*` env var, so the
 * same value the app sends to is the value updated here. Run it locally (or in
 * CI) with `RESEND_API_KEY` and the aliases in `.env`; the deployed container
 * only carries the built assets, not this script or the source files.
 *
 * Existing templates are updated by alias. If the alias does not exist yet, the
 * template is created with that alias. Either way it is published afterwards,
 * because Resend only sends published templates.
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { EMAIL_TEMPLATES, templateVariables } from '../server/emails/catalog.ts'

const API = 'https://api.resend.com'
const dryRun = process.argv.includes('--dry-run')
const key = (process.env.RESEND_API_KEY || process.env.NUXT_RESEND_API_KEY || '').trim()

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const templatesDir = fileURLToPath(new URL('../server/emails/templates/', import.meta.url))

interface TemplatePayload {
  name: string
  html: string
  alias?: string
  variables: { key: string; type: 'string' }[]
}

interface ApiResult {
  ok: boolean
  status: number
  data: unknown
}

if (!dryRun && !key) {
  console.error(
    'Set RESEND_API_KEY (or NUXT_RESEND_API_KEY) before syncing, e.g. in .env.\n' +
      'Use --dry-run to check which templates would be pushed.',
  )
  process.exit(1)
}

async function request(method: string, path: string, body?: TemplatePayload): Promise<ApiResult> {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const text = await response.text()
  let data: unknown = null

  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }

  return { ok: response.ok, status: response.status, data }
}

function describe(data: unknown) {
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as { message: unknown }).message)
  }

  return JSON.stringify(data)
}

async function publish(alias: string) {
  const result = await request('POST', `/templates/${encodeURIComponent(alias)}/publish`)

  if (!result.ok) {
    throw new Error(`publish ${alias} failed (${result.status}): ${describe(result.data)}`)
  }
}

let failed = 0

for (const [kind, template] of Object.entries(EMAIL_TEMPLATES)) {
  const alias = process.env[template.env]?.trim()

  if (!alias) {
    console.log(`${kind.padEnd(24)} skipped — ${template.env} is empty`)
    continue
  }

  const html = await readFile(join(templatesDir, template.file), 'utf8')
  const variables = templateVariables(html).map((variable) => ({
    key: variable,
    type: 'string' as const,
  }))

  if (dryRun) {
    const label = variables.length === 1 ? 'variable' : 'variables'
    console.log(
      `${kind.padEnd(24)} would sync → ${alias} (${variables.length} ${label}, ${html.length} bytes)`,
    )
    continue
  }

  const payload: TemplatePayload = {
    name: `Cross-Love Movement — ${kind}`,
    html,
    variables,
  }

  try {
    const updated = await request('PATCH', `/templates/${encodeURIComponent(alias)}`, payload)

    if (updated.ok) {
      await publish(alias)
      console.log(`${kind.padEnd(24)} updated + published → ${alias}`)
      continue
    }

    if (updated.status !== 404) {
      throw new Error(`update failed (${updated.status}): ${describe(updated.data)}`)
    }

    if (UUID.test(alias)) {
      throw new Error(`no template with id ${alias} — check ${template.env}`)
    }

    const created = await request('POST', '/templates', { ...payload, alias })

    if (!created.ok) {
      throw new Error(`create failed (${created.status}): ${describe(created.data)}`)
    }

    await publish(alias)
    console.log(`${kind.padEnd(24)} created + published → ${alias}`)
  } catch (error) {
    failed += 1
    console.error(`${kind.padEnd(24)} FAILED: ${(error as Error).message}`)
  }
}

if (failed > 0) {
  console.error(`\n${failed} template(s) failed to sync.`)
  process.exitCode = 1
}
