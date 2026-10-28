import { listPublishedEvents } from '../../features/events/repository'

/** Public list: published events with live capacity. No registrant data. */
export default defineEventHandler(async () => {
  return listPublishedEvents()
})
