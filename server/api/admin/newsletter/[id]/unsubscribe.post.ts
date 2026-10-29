import { requirePermission } from '../../../../features/auth/guards'
import { unsubscribeSubscriber } from '../../../../features/newsletter/repository'

/**
 * POST /api/admin/newsletter/:id/unsubscribe
 *
 * Staff-side removal at someone's request (a reply to an issue, a phone call).
 * The row is kept with status `unsubscribed` so the history is visible.
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageNewsletter')

  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, statusMessage: 'Invalid subscriber id' })

  const updated = await unsubscribeSubscriber(id)

  if (!updated) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Subscriber not found or already unsubscribed',
    })
  }

  return { message: 'Subscriber removed from the list.' }
})
