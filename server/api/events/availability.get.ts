import type { Event } from '#shared/types/content'
import { toAvailability } from '#shared/utils/events'
import { queryCollection } from '@nuxt/content/server'

import { confirmedSeats } from '../../features/events/repository'

/**
 * Live capacity for every event, recomputed per request.
 * Only counts are exposed — never registrant details.
 */
export default defineEventHandler(async (event) => {
  const events = (await queryCollection(event, 'events').all()) as Event[]

  return events.map((item) => toAvailability(item, confirmedSeats(item.slug)))
})
