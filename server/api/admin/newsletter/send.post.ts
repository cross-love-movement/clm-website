import { requirePermission } from '../../../features/auth/guards'
import { issueSchema } from '../../../features/newsletter/schemas'
import { sendNewsletterIssue } from '../../../features/newsletter/repository'
import { parseOrThrow } from '../../../utils/validation'

/**
 * POST /api/admin/newsletter/send
 *
 * Queues one copy of the issue per subscribed address. The outbox worker
 * delivers them, so a large list spreads over time instead of blocking the
 * request or hitting Resend's rate limit.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageNewsletter')

  const input = parseOrThrow(issueSchema, await readBody(event))
  const { recipients } = await sendNewsletterIssue(input)

  return { recipients }
})
