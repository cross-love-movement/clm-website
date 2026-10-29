import { unsubscribeByToken } from '../../features/newsletter/repository'
import { unsubscribeSchema } from '../../features/newsletter/schemas'
import { parseOrThrow } from '../../utils/validation'

/**
 * POST /api/newsletter/unsubscribe
 *
 * Called by `/newsletter/unsubscribe` on load, never by clicking the link
 * itself — mail scanners prefetch links, and a GET must not mutate the list.
 */
export default defineEventHandler(async (event) => {
  const { token } = parseOrThrow(unsubscribeSchema, await readBody(event))
  const found = await unsubscribeByToken(token)

  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Unknown unsubscribe link',
      data: {
        message:
          'That unsubscribe link is not valid. Reply to any newsletter and we will remove you.',
      },
    })
  }

  return { message: 'You have been unsubscribed. You will not receive the monthly note again.' }
})
