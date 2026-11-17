import { requirePermission } from '../../../features/auth/guards'
import {
  countSubscribers,
  listSubscribers,
  summariseSubscribers,
} from '../../../features/newsletter/repository'
import type { SubscriberStatus } from '#shared/types/content'
import { SUBSCRIBER_STATUSES } from '#shared/types/content'
import { csvLine } from '../../../utils/csv'
import { parsePage, resolvePage } from '../../../utils/pagination'

/**
 * GET /api/admin/newsletter
 *   ?status=subscribed|unsubscribed
 *   ?q=search  ?page=  ?pageSize=
 *   ?format=csv  every matching subscriber, ignoring the page
 */
export default defineEventHandler(async (event) => {
  await requirePermission(event, 'canManageNewsletter')

  const query = getQuery(event)
  const status =
    typeof query.status === 'string' &&
    SUBSCRIBER_STATUSES.includes(query.status as SubscriberStatus)
      ? (query.status as SubscriberStatus)
      : undefined
  const search = typeof query.q === 'string' && query.q ? query.q : undefined
  const filter = { status, search }

  if (query.format === 'csv') {
    const subscribers = await listSubscribers(filter)
    const lines = [
      csvLine(['email', 'status', 'source', 'subscribed_at', 'unsubscribed_at']),
      ...subscribers.map((row) =>
        csvLine([row.email, row.status, row.source, row.subscribedAt, row.unsubscribedAt ?? '']),
      ),
    ]

    setHeader(event, 'content-type', 'text/csv; charset=utf-8')
    setHeader(event, 'content-disposition', 'attachment; filename="clm-newsletter.csv"')

    return lines.join('\n')
  }

  const requested = parsePage(event)
  const total = await countSubscribers(filter)
  const pagination = resolvePage(total, requested)
  const subscribers = await listSubscribers({
    ...filter,
    limit: pagination.pageSize,
    offset: pagination.offset,
  })

  return {
    subscribers,
    summary: await summariseSubscribers(),
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: pagination.total,
    pageCount: pagination.pageCount,
  }
})
