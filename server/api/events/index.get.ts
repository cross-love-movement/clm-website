import { hasDatabase } from '../../database/client'
import { listPublishedEvents } from '../../features/events/repository'

/**
 * Public list: published events with live capacity. No registrant data.
 * Without a database the calendar is empty rather than a failed page.
 */
export default defineEventHandler(async () => {
  if (!hasDatabase()) return []

  return listPublishedEvents()
})
