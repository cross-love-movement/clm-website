import { hasDatabase } from '../database/client'
import { subscribeToNewsletter } from '../features/newsletter/repository'
import { MAILBOXES } from '../utils/mailboxes'
import { newsletterSchema } from '../utils/schemas'

/**
 * Adds an address to the newsletter list and queues a confirmation to the
 * subscriber. No copy goes to the organisation inbox — the list in the staff
 * portal is the record.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (isBot(body)) {
    return { message: 'You are subscribed.' }
  }

  rateLimit(`newsletter:${getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'}`, 3)

  const data = parseOrThrow(newsletterSchema, body)

  if (!hasDatabase()) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Newsletter signup is temporarily unavailable',
      data: {
        message: `Newsletter signup is unavailable right now. Please email ${MAILBOXES.info} and we will add you.`,
      },
    })
  }

  await subscribeToNewsletter(data.email)

  return {
    message:
      'You are subscribed. If this is a new address, a confirmation is on its way to your inbox.',
  }
})
