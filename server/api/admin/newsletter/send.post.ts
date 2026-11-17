import { recordAudit } from '../../../features/audit/repository'
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
  const actor = await requirePermission(event, 'canManageNewsletter')

  const input = parseOrThrow(issueSchema, await readBody(event))
  const { recipients } = await sendNewsletterIssue(input)

  await recordAudit(actor, {
    action: 'newsletter.sent',
    entity: 'newsletter',
    summary: `Sent “${input.subject}” to ${recipients} subscriber(s).`,
    metadata: { subject: input.subject, recipients },
  })

  return { recipients }
})
